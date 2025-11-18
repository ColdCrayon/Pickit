import { decimalToAmerican, americanToDecimal } from "../web/source/lib/utils";

describe("decimalToAmerican", () => {
  it("converts decimal plus money odds to positive American values", () => {
    expect(decimalToAmerican(2.5)).toBe("+150");
    expect(decimalToAmerican(3.2)).toBe("+220");
  });

  it("converts decimal odds below 2.0 to negative American values", () => {
    expect(decimalToAmerican(1.5)).toBe("-200");
    expect(decimalToAmerican(1.91)).toBe("-110");
  });

  it("rounds consistently and inverts with americanToDecimal", () => {
    const decimalOdds = 1.91;
    const american = Number(decimalToAmerican(decimalOdds));

    expect(american).toBe(-110);
    expect(americanToDecimal(american)).toBeCloseTo(decimalOdds, 2);
  });
});
