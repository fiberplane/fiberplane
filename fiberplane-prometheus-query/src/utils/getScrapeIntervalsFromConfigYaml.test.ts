import {
  getScrapeIntervalsFromConfigYaml,
  parsePrometheusDurationToSeconds,
} from "./getScrapeIntervalsFromConfigYaml";

describe("parsePrometheusDurationToSeconds", () => {
  it("should parse a duration string with only seconds", () => {
    expect(parsePrometheusDurationToSeconds("30s")).toBe(30);
  });

  it("should parse a duration string with minutes and seconds", () => {
    expect(parsePrometheusDurationToSeconds("5m30s")).toBe(330);
  });

  it("should parse a duration string with hours, minutes, and seconds", () => {
    expect(parsePrometheusDurationToSeconds("2h30m30s")).toBe(9030);
  });

  it("should parse a duration string with days, hours, minutes, and seconds", () => {
    expect(parsePrometheusDurationToSeconds("3d2h30m30s")).toBe(268_230);
  });

  it("should parse a duration string with weeks, days, hours, minutes, and seconds", () => {
    expect(parsePrometheusDurationToSeconds("2w3d2h30m30s")).toBe(1_477_830);
  });

  it("should parse a duration string with milliseconds", () => {
    expect(parsePrometheusDurationToSeconds("500ms")).toBe(0.5);
  });

  it("should return null for an invalid duration string", () => {
    expect(parsePrometheusDurationToSeconds("invalid")).toBe(null);
  });
});

describe("parsePrometheusConfigScrapeIntervalsFromYaml", () => {
  it("should parse a Prometheus config with a single scrape interval", () => {
    const yaml = `
global:
  scrape_interval: 15s
`;

    expect(getScrapeIntervalsFromConfigYaml(yaml)).toEqual([15]);
  });

  it("should parse an am Prometheus config with several scrape configs", () => {
    const yaml = `
global:
  scrape_interval: 5s
  scrape_timeout: 5s
  evaluation_interval: 15s
rule_files:
- /var/folders/73/cc6t52gs1kb9ht69wqqxgxdh0000gn/T/autometrics.rules.yml
scrape_configs:
- job_name: am_0
  honor_timestamps: true
  scrape_interval: 5s
  scrape_timeout: 5s
  metrics_path: /metrics
  scheme: http
  follow_redirects: true
  enable_http2: true
  static_configs:
  - targets:
    - localhost:8080
`;

    expect(getScrapeIntervalsFromConfigYaml(yaml)).toEqual([5, 5]);
  });
});
