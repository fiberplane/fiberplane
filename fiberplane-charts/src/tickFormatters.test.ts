import {
  getScientificFormatterForAxis,
  getTimeFormatterForAxis,
  getPercentageFormatter,
} from "./tickFormatters";

test("it can format large numbers with scientific notation", () => {
  const formatter = getScientificFormatterForAxis({
    minValue: 0,
    maxValue: 123456789,
  });

  expect(formatter(123456789)).toBe("123M");
  expect(formatter(12345678)).toBe("12M");
  expect(formatter(1234567)).toBe("1.2M");
  expect(formatter(123456)).toBe("0.1M");
  expect(formatter(12345)).toBe("12k");
  expect(formatter(1234)).toBe("1.2k");
  expect(formatter(123)).toBe("0.1k");
  expect(formatter(12)).toBe("12");
  expect(formatter(1)).toBe("1");
  expect(formatter(0)).toBe("0");
  expect(formatter(0.1)).toBe("0.1");
  expect(formatter(0.01)).toBe("0.0");

  expect(formatter(-1234567)).toBe("-1.2M");
});

test("it can format small numbers with scientific notation", () => {
  const formatter = getScientificFormatterForAxis({
    minValue: 0,
    maxValue: 123.456789,
  });

  expect(formatter(123.456789)).toBe("123");
  expect(formatter(12.3456789)).toBe("12");
  expect(formatter(1.23456789)).toBe("1.2");
  expect(formatter(0.12345678)).toBe("0.1");
  expect(formatter(0.01234567)).toBe("12m");
  expect(formatter(0.00123456)).toBe("1.2m");
  expect(formatter(0.00012345)).toBe("0.1m");
  expect(formatter(0.00001234)).toBe("12μ");
  expect(formatter(0.00000123)).toBe("1.2μ");
  expect(formatter(0)).toBe("0");

  expect(formatter(-1.23456789)).toBe("-1.2");
});

test("it can format time values", () => {
  const dayInMonthFormatter = getTimeFormatterForAxis({
    minValue: 1691496477.932,
    maxValue: 1692446877.932,
  });
  expect(dayInMonthFormatter(1691496477.932)).toBe("Tue 8");

  const dayInWeekFormatter = getTimeFormatterForAxis({
    minValue: 1691496477.932,
    maxValue: 1691928477.932,
  });
  expect(dayInWeekFormatter(1691496477.932)).toBe("Tue 12h");

  const hourFormatter = getTimeFormatterForAxis({
    minValue: 1691496477.932,
    maxValue: 1691579277.932,
  });
  expect(hourFormatter(1691496477.932)).toBe("12:07");

  const minuteFormatter = getTimeFormatterForAxis({
    minValue: 1691496477.932,
    maxValue: 1691496837.932,
  });
  expect(minuteFormatter(1691496477.932)).toBe("12:07:57");

  const secondFormatter = getTimeFormatterForAxis({
    minValue: 1691496477.932,
    maxValue: 1691496489.932,
  });
  expect(secondFormatter(1691496477.932)).toBe("57.932");

  const millisecondFormatter = getTimeFormatterForAxis({
    minValue: 1691496477.932,
    maxValue: 1691496478.932,
  });
  expect(millisecondFormatter(1691496477.932)).toBe(".932");
});

test("it can format percentages", () => {
  const percentageFormatter = getPercentageFormatter();
  expect(percentageFormatter(0)).toBe("0%");
  expect(percentageFormatter(0.005)).toBe("0.5%");
  expect(percentageFormatter(0.01)).toBe("1%");
  expect(percentageFormatter(0.0101)).toBe("1.0%");
  expect(percentageFormatter(0.0106)).toBe("1.1%");
  expect(percentageFormatter(0.1)).toBe("10%");
  expect(percentageFormatter(0.999)).toBe("99.9%");
  expect(percentageFormatter(1)).toBe("100%");
});
