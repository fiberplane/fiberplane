import { translateObjectivePercentileToPromQlPercentile } from "./queries";

describe("translateObjectivePercentileToPromQlPercentile()", () => {
  it("should return 0.9 for 90", () => {
    expect(translateObjectivePercentileToPromQlPercentile("90")).toEqual(
      "0.90",
    );
  });

  it("should return 0.95 for 95", () => {
    expect(translateObjectivePercentileToPromQlPercentile("95")).toEqual(
      "0.95",
    );
  });

  it("should return 0.99 for 99", () => {
    expect(translateObjectivePercentileToPromQlPercentile("99")).toEqual(
      "0.99",
    );
  });

  it("should return 0.999 for 99.9", () => {
    expect(translateObjectivePercentileToPromQlPercentile("99.9")).toEqual(
      "0.999",
    );
  });
});
