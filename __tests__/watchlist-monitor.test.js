/**
 * __tests__/watchlist-monitor.test.js
 *
 * Test suite for watchlist monitoring and notification functions
 */

const admin = require("firebase-admin");
const {
  hasSignificantOddsChange,
  formatOddsChange,
} = require("../functions/lib/watchlist-monitor");

// Mock Firebase Admin
jest.mock("firebase-admin", () => ({
  firestore: jest.fn(() => ({
    collection: jest.fn(),
  })),
  auth: jest.fn(),
}));

jest.mock("firebase-functions/logger", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

describe("Watchlist Monitor Functions", () => {
  describe("hasSignificantOddsChange", () => {
    test("detects significant positive change", () => {
      const result = hasSignificantOddsChange(-110, -150, 10);
      expect(result).toBe(true);
    });

    test("detects significant negative change", () => {
      const result = hasSignificantOddsChange(-150, -110, 10);
      expect(result).toBe(true);
    });

    test("ignores small changes below threshold", () => {
      const result = hasSignificantOddsChange(-110, -115, 10);
      expect(result).toBe(false);
    });

    test("returns false for null/undefined odds", () => {
      expect(hasSignificantOddsChange(null, -110, 10)).toBe(false);
      expect(hasSignificantOddsChange(-110, null, 10)).toBe(false);
      expect(hasSignificantOddsChange(undefined, -110, 10)).toBe(false);
    });

    test("works with custom thresholds", () => {
      // 5% threshold - should trigger
      expect(hasSignificantOddsChange(-110, -116, 5)).toBe(true);

      // 15% threshold - should not trigger
      expect(hasSignificantOddsChange(-110, -120, 15)).toBe(false);
    });

    test("calculates percentage correctly for positive odds", () => {
      // +100 to +150 is 50% change
      expect(hasSignificantOddsChange(100, 150, 40)).toBe(true);
      expect(hasSignificantOddsChange(100, 150, 60)).toBe(false);
    });

    test("calculates percentage correctly for negative odds", () => {
      // -100 to -200 is 100% change
      expect(hasSignificantOddsChange(-100, -200, 90)).toBe(true);
      expect(hasSignificantOddsChange(-100, -200, 110)).toBe(false);
    });
  });

  describe("formatOddsChange", () => {
    test("formats positive to more positive odds", () => {
      const result = formatOddsChange(100, 150);
      expect(result).toBe("+100 ↑ +150");
    });

    test("formats negative to more negative odds", () => {
      const result = formatOddsChange(-110, -150);
      expect(result).toBe("-110 ↓ -150");
    });

    test("formats negative to less negative odds", () => {
      const result = formatOddsChange(-150, -110);
      expect(result).toBe("-150 ↑ -110");
    });

    test("formats crossing zero boundary", () => {
      const result1 = formatOddsChange(-110, 100);
      expect(result1).toBe("-110 ↑ +100");

      const result2 = formatOddsChange(100, -110);
      expect(result2).toBe("+100 ↓ -110");
    });

    test("shows correct direction symbol", () => {
      expect(formatOddsChange(-110, -150)).toContain("↓");
      expect(formatOddsChange(-150, -110)).toContain("↑");
      expect(formatOddsChange(100, 150)).toContain("↑");
      expect(formatOddsChange(150, 100)).toContain("↓");
    });
  });

  describe("Odds Change Detection Logic", () => {
    test("10% threshold catches meaningful spread movements", () => {
      // Typical spread odds movements
      expect(hasSignificantOddsChange(-110, -130, 10)).toBe(true); // ~18%
      expect(hasSignificantOddsChange(-110, -115, 10)).toBe(false); // ~4.5%
    });

    test("handles edge case of odds at exactly threshold", () => {
      // -110 to -121 is exactly 10% change
      const result = hasSignificantOddsChange(-110, -121, 10);
      expect(result).toBe(true);
    });

    test("symmetric detection (direction does not matter)", () => {
      const increase = hasSignificantOddsChange(-110, -150, 10);
      const decrease = hasSignificantOddsChange(-150, -110, 10);
      expect(increase).toBe(decrease);
    });
  });
});

describe("Notification Filtering Logic", () => {
  describe("Rate Limiting", () => {
    test("allows notification if never sent before", () => {
      const canSend = (lastNotified) => {
        if (!lastNotified) return true;
        const now = Date.now();
        const minutesSince = (now - lastNotified) / (1000 * 60);
        return minutesSince >= 60;
      };

      expect(canSend(null)).toBe(true);
      expect(canSend(undefined)).toBe(true);
    });

    test("blocks notification if sent recently", () => {
      const canSend = (lastNotified, minIntervalMinutes = 60) => {
        if (!lastNotified) return true;
        const now = Date.now();
        const minutesSince = (now - lastNotified) / (1000 * 60);
        return minutesSince >= minIntervalMinutes;
      };

      const now = Date.now();
      const thirtyMinutesAgo = now - 30 * 60 * 1000;
      const twoHoursAgo = now - 120 * 60 * 1000;

      expect(canSend(thirtyMinutesAgo, 60)).toBe(false);
      expect(canSend(twoHoursAgo, 60)).toBe(true);
    });

    test("respects custom interval", () => {
      const canSend = (lastNotified, minIntervalMinutes) => {
        if (!lastNotified) return true;
        const now = Date.now();
        const minutesSince = (now - lastNotified) / (1000 * 60);
        return minutesSince >= minIntervalMinutes;
      };

      const now = Date.now();
      const tenMinutesAgo = now - 10 * 60 * 1000;

      // Should block with 15-minute interval
      expect(canSend(tenMinutesAgo, 15)).toBe(false);

      // Should allow with 5-minute interval
      expect(canSend(tenMinutesAgo, 5)).toBe(true);
    });
  });
});

describe("Market Change Detection", () => {
  const createMarket = (spreadHome, spreadAway, mlHome, mlAway) => ({
    spread: {
      home: spreadHome,
      away: spreadAway,
      point: -3.5,
    },
    moneyline: {
      home: mlHome,
      away: mlAway,
    },
    totals: {
      over: -110,
      under: -110,
      point: 220.5,
    },
  });

  test("detects spread changes", () => {
    const before = createMarket(-110, -110, -150, 130);
    const after = createMarket(-150, 130, -150, 130);

    const homeChanged = hasSignificantOddsChange(
      before.spread.home,
      after.spread.home,
      10
    );
    expect(homeChanged).toBe(true);
  });

  test("detects moneyline changes", () => {
    const before = createMarket(-110, -110, -150, 130);
    const after = createMarket(-110, -110, -200, 180);

    const homeChanged = hasSignificantOddsChange(
      before.moneyline.home,
      after.moneyline.home,
      10
    );
    expect(homeChanged).toBe(true);
  });

  test("ignores no changes", () => {
    const before = createMarket(-110, -110, -150, 130);
    const after = createMarket(-110, -110, -150, 130);

    const spreadChanged = hasSignificantOddsChange(
      before.spread.home,
      after.spread.home,
      10
    );
    const mlChanged = hasSignificantOddsChange(
      before.moneyline.home,
      after.moneyline.home,
      10
    );

    expect(spreadChanged).toBe(false);
    expect(mlChanged).toBe(false);
  });
});

describe("Notification Message Formatting", () => {
  test("creates readable odds change messages", () => {
    const testCases = [
      {
        old: -110,
        new: -150,
        expected: "-110 ↓ -150",
      },
      {
        old: -150,
        new: -110,
        expected: "-150 ↑ -110",
      },
      {
        old: 100,
        new: 150,
        expected: "+100 ↑ +150",
      },
      {
        old: -110,
        new: 110,
        expected: "-110 ↑ +110",
      },
    ];

    testCases.forEach(({ old, new: newOdds, expected }) => {
      expect(formatOddsChange(old, newOdds)).toBe(expected);
    });
  });

  test("handles even money (±100) correctly", () => {
    expect(formatOddsChange(100, 150)).toBe("+100 ↑ +150");
    expect(formatOddsChange(-100, -150)).toBe("-100 ↓ -150");
  });
});
