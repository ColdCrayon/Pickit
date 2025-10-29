const fs = require("fs");
const path = require("path");
const {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} = require("@firebase/rules-unit-testing");

let testEnv;

beforeAll(async () => {
  const rules = fs.readFileSync(
    path.join(__dirname, "..", "firestore.rules"),
    "utf8"
  );
  testEnv = await initializeTestEnvironment({
    projectId: "pickit-rules-tests",
    firestore: { rules },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

function ctxAnon() {
  return testEnv.unauthenticatedContext();
}
function ctxUser(uid, claims = {}) {
  return testEnv.authenticatedContext(uid, claims);
}

async function seed(cb) {
  await testEnv.withSecurityRulesDisabled(async (c) => {
    await cb(c.firestore());
  });
}

describe("users", () => {
  test("user can read & write own profile; cannot edit isAdmin/isPremium", async () => {
    await seed(async (db) => {
      await db
        .collection("users")
        .doc("u1")
        .set({
          email: "a@b.com",
          username: "c",
          isAdmin: false,
          isPremium: false,
        });
    });

    const me = ctxUser("u1").firestore();
    const myDoc = me.collection("users").doc("u1");

    await assertSucceeds(myDoc.get());
    await assertSucceeds(myDoc.update({ username: "newname" }));

    // Cannot elevate privileges
    await assertFails(myDoc.update({ isAdmin: true }));
    await assertFails(myDoc.update({ isPremium: true }));
  });

  test("user cannot read or write someone else’s profile", async () => {
    await seed(async (db) => {
      await db
        .collection("users")
        .doc("u2")
        .set({
          email: "x@y.com",
          username: "z",
          isAdmin: false,
          isPremium: false,
        });
    });

    const me = ctxUser("u1").firestore();
    const otherDoc = me.collection("users").doc("u2");

    await assertFails(otherDoc.get());
    await assertFails(otherDoc.update({ username: "hack" }));
  });

  test("admin can update any user (including flags)", async () => {
    await seed(async (db) => {
      await db
        .collection("users")
        .doc("admin")
        .set({ isAdmin: true, isPremium: false });
      await db
        .collection("users")
        .doc("u3")
        .set({ isAdmin: false, isPremium: false });
    });

    const adminDb = ctxUser("admin").firestore();
    await assertSucceeds(
      adminDb.collection("users").doc("u3").update({ isPremium: true })
    );
  });
});

describe("gameTickets", () => {
  beforeEach(async () => {
    await seed(async (db) => {
      await db
        .collection("users")
        .doc("std")
        .set({ isAdmin: false, isPremium: false });
      await db
        .collection("users")
        .doc("pro")
        .set({ isAdmin: false, isPremium: true });
      await db
        .collection("users")
        .doc("adm")
        .set({ isAdmin: true, isPremium: false });

      await db
        .collection("gameTickets")
        .doc("unsettled")
        .set({ serverSettled: false, title: "t1" });
      await db
        .collection("gameTickets")
        .doc("settled")
        .set({ serverSettled: true, title: "t2" });
    });
  });

  test("anon cannot read", async () => {
    const db = ctxAnon().firestore();
    await assertFails(db.collection("gameTickets").doc("settled").get());
  });

  test("standard can read only settled", async () => {
    const db = ctxUser("std").firestore();
    await assertSucceeds(db.collection("gameTickets").doc("settled").get());
    await assertFails(db.collection("gameTickets").doc("unsettled").get());
  });

  test("premium can read all", async () => {
    const db = ctxUser("pro").firestore();
    await assertSucceeds(db.collection("gameTickets").doc("settled").get());
    await assertSucceeds(db.collection("gameTickets").doc("unsettled").get());
  });

  test("only admin can write", async () => {
    const std = ctxUser("std").firestore();
    await assertFails(
      std.collection("gameTickets").doc("x").set({ serverSettled: false })
    );

    const adm = ctxUser("adm").firestore();
    await assertSucceeds(
      adm.collection("gameTickets").doc("x").set({ serverSettled: false })
    );
  });
});

describe("arbTickets", () => {
  beforeEach(async () => {
    await seed(async (db) => {
      await db
        .collection("users")
        .doc("std")
        .set({ isAdmin: false, isPremium: false });
      await db
        .collection("users")
        .doc("pro")
        .set({ isAdmin: false, isPremium: true });
      await db
        .collection("users")
        .doc("adm")
        .set({ isAdmin: true, isPremium: false });

      await db
        .collection("arbTickets")
        .doc("unsettled")
        .set({ serverSettled: false, v: 1 });
      await db
        .collection("arbTickets")
        .doc("settled")
        .set({ serverSettled: true, v: 1 });
    });
  });

  test("standard can read only settled", async () => {
    const db = ctxUser("std").firestore();
    await assertSucceeds(db.collection("arbTickets").doc("settled").get());
    await assertFails(db.collection("arbTickets").doc("unsettled").get());
  });

  test("premium can read all; only admin can write", async () => {
    const pro = ctxUser("pro").firestore();
    await assertSucceeds(pro.collection("arbTickets").doc("unsettled").get());

    const std = ctxUser("std").firestore();
    await assertFails(
      std.collection("arbTickets").doc("w").set({ serverSettled: true })
    );

    const adm = ctxUser("adm").firestore();
    await assertSucceeds(
      adm.collection("arbTickets").doc("w").set({ serverSettled: true })
    );
  });
});
