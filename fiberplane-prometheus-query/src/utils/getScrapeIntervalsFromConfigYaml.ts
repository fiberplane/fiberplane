/**
 * Parses a Prometheus YAML configuration and returns the scrape intervals.
 *
 * @param yaml The YAML configuration string to parse.
 * @returns An array of scrape intervals in seconds.
 *
 * @note This function will return duplicate values if the YAML config contains
 *       scrape intervals of the same value.
 */
export function getScrapeIntervalsFromConfigYaml(yaml: string): Array<number> {
  return yaml.split("\n").reduce((accumulator, line) => {
    const match = line.match(/scrape_interval:\s*(.*)/);

    if (match?.[1]) {
      const duration = parsePrometheusDurationToSeconds(match[1]);

      if (duration) {
        accumulator.push(duration);
      }
    }

    return accumulator;
  }, [] as Array<number>);
}

/**
 * Given a duration string from a Prometheus YAML config, parse that duration
 * into seconds.
 *
 * Prometheus durations inside a config can be represented by a string matching
 * the regex inside this function
 * (see: https://prometheus.io/docs/prometheus/latest/configuration/configuration/).
 *
 * I modified the regex to use a negative-lookahead to prevent matching "ms" in
 * "m" (minutes).
 *
 * @note This function does not consider leap years.
 */
export function parsePrometheusDurationToSeconds(
  duration: string,
): number | null {
  const matches = duration.match(PROMETHEUS_DURATION_REGEX);

  if (!matches) {
    return null;
  }

  const years = matches[3] ? Number.parseInt(matches[3], 10) : 0;
  const weeks = matches[5] ? Number.parseInt(matches[5], 10) : 0;
  const days = matches[7] ? Number.parseInt(matches[7], 10) : 0;
  const hours = matches[9] ? Number.parseInt(matches[9], 10) : 0;
  const minutes = matches[11] ? Number.parseInt(matches[11], 10) : 0;
  const seconds = matches[13] ? Number.parseInt(matches[13], 10) : 0;
  const milliseconds = matches[15] ? Number.parseInt(matches[15], 10) : 0;

  const durationInSeconds =
    years * 31_536_000 + // seconds in a year (considering non-leap years)
    weeks * 604_800 + // seconds in a week
    days * 86_400 + // seconds in a day
    hours * 3600 + // seconds in an hour
    minutes * 60 + // seconds in a minute
    seconds +
    milliseconds / 1000;

  if (Number.isNaN(durationInSeconds)) {
    return null;
  }

  if (durationInSeconds === 0) {
    return null;
  }

  return durationInSeconds;
}

/**
 * This is the regex that describes valid duration values inside a Prometheus
 * config.
 *
 * See: https://prometheus.io/docs/prometheus/latest/configuration/configuration/
 *
 * @note I modified the regex to use a negative-lookahead to prevent matching
 *       "ms" in "m" (minutes), which you can see in `([0-9]+)m(?!s)`
 */
export const PROMETHEUS_DURATION_REGEX =
  // eslint-disable-next-line unicorn/better-regex
  /((([0-9]+)y)?(([0-9]+)w)?(([0-9]+)d)?(([0-9]+)h)?(([0-9]+)m(?!s))?(([0-9]+)s)?(([0-9]+)ms)?|0)/;
