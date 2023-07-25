/**
 * Fetches timeseries data from the Prometheus `query_range` endpoint.
 *
 * @param query Prometheus query string.
 * @param timeRange Time range to fetch the data for.
 */ async function querySeries(query, timeRange, { baseUrl , mode ="cors" , ...requestInit }) {
    const [stepParam, stepSeconds] = getStepFromTimeRange(timeRange);
    const params = new URLSearchParams();
    params.append("query", query);
    params.append("start", roundToGrid(timeRange.from, stepSeconds, Math.floor));
    params.append("end", roundToGrid(timeRange.to, stepSeconds, Math.ceil));
    params.append("step", stepParam);
    const url = `${baseUrl}/prometheus/api/v1/query_range?${params.toString()}`;
    const response = await fetch(url, {
        mode,
        ...requestInit
    });
    if (!response.ok) {
        throw new Error("Error fetching prometheus data");
    }
    const jsonResponse = await response.json();
    if (!isObject(jsonResponse)) {
        throw new Error("Unexpected response from Prometheus");
    }
    const { data  } = jsonResponse;
    if (!isObject(data)) {
        throw new Error("Invalid or missing data in Prometheus response");
    }
    const { result  } = data;
    if (!Array.isArray(result)) {
        throw new Error("Invalid or missing results in Prometheus response");
    }
    return result.map(metricEntryToTimeseries);
}
/**
 * Maps an entry from the result array returned by the Prometheus API to a
 * Timeseries object.
 *
 * @param entry An entry returned by the Prometheus `query_range` API.
 */ function metricEntryToTimeseries(entry) {
    if (!isObject(entry)) {
        throw new Error("Unexpected entry in Prometheus response");
    }
    const { metric , values  } = entry;
    if (!isObject(metric) || !Array.isArray(values)) {
        throw new Error("Invalid or missing fields in Prometheus entry");
    }
    const { __name__: name = "" , ...labels } = metric;
    if (typeof name !== "string") {
        throw new Error("Invalid or missing name in Prometheus response");
    }
    if (!hasOnlyStringValues(labels)) {
        throw new Error("Invalid or missing label value in Prometheus response");
    }
    const metrics = values.map((value)=>{
        if (!Array.isArray(value) || value.length !== 2) {
            throw new Error("Invalid or missing metric value in Prometheus response");
        }
        return {
            time: new Date(value[0] * 1000).toISOString(),
            value: Number.parseFloat(value[1]),
            attributes: {},
            resource: {}
        };
    });
    return {
        name,
        labels,
        metrics,
        attributes: {},
        resource: {},
        visible: true
    };
}
/**
 * Rounds the timestamp to a "grid" with intervals defined by the step size.
 * This assures that when we scroll a chart forward or backward in time, we
 * "snap" to the same grid, to avoid the issue of bucket realignment, giving
 * unexpected jumps in the graph.
 *
 * @param timestamp The timestamp to round.
 * @param stepSeconds The amount of seconds used for the step size.
 * @param round The rounding function to use. Use `Math.floor` for the start
 *              of the time range, and `Math.ceil` for the end.
 */ function roundToGrid(timestamp, stepSeconds, round) {
    const seconds = getSecondsFromTimestamp(timestamp);
    return new Date(round(seconds / stepSeconds) * stepSeconds * 1000).toISOString();
}
/**
 * Calculates the step size to be used in Prometheus queries.
 *
 * @returns Step size, both as a string to use with Prometheus, and a number of
 *          seconds.
 */ function getStepFromTimeRange(timeRange) {
    const from = getSecondsFromTimestamp(timeRange.from);
    const to = getSecondsFromTimestamp(timeRange.to);
    let step = (to - from) / 120;
    let secondsMultiplier = 1;
    let unit = "s";
    if (step >= 60) {
        step /= 60;
        secondsMultiplier = 60;
        unit = "m";
        if (step >= 60) {
            step /= 60;
            secondsMultiplier *= 60;
            unit = "h";
        }
    }
    const amount = Math.ceil(step);
    return [
        `${amount}${unit}`,
        amount * secondsMultiplier
    ];
}
function getSecondsFromTimestamp(timestamp) {
    return +new Date(timestamp) / 1000;
}
function hasOnlyStringValues(object) {
    return Object.values(object).every((label)=>typeof label === "string");
}
function isObject(maybeObject) {
    return typeof maybeObject === "object" && maybeObject != null;
}

export { getStepFromTimeRange, metricEntryToTimeseries, querySeries, roundToGrid };
//# sourceMappingURL=index.js.map
