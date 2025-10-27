import { scanPropOverUnder } from "./scanOverUnder.js";
import { scanPropYesNo } from "./scanYesNo.js";

export async function scanPropsForEvent(evDoc, propDoc) {
  const d = propDoc.data() || {};
  const selections = d.selections || [];
  if (selections.includes("over") && selections.includes("under")) {
    return scanPropOverUnder(evDoc, propDoc);
  }
  if (selections.includes("yes") && selections.includes("no")) {
    return scanPropYesNo(evDoc, propDoc);
  }
  return 0; // unsupported shape for now
}

