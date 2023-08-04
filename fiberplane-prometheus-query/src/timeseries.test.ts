import { querySeries } from "./timeseries";

test("it rounds the time range", () => {
  const mockedFetch = jest.fn(() => new Promise<Response>(() => {}));
  globalThis.fetch = mockedFetch;

  const query = "go_memstats_alloc_bytes";
  const options = {
    baseUrl: "http://localhost:6789",
    headers: { Authorization: "Basic user:pass" },
  };

  querySeries(
    query,
    { from: "2023-07-18T16:00:15.000Z", to: "2023-07-18T20:00:15.000Z" },
    options,
  );

  const expectedParams = new URLSearchParams();
  expectedParams.append("query", query);

  // start should be rounded down
  expectedParams.append("start", "2023-07-18T16:00:00.000Z");

  // end should be rounded up to the next step
  expectedParams.append("end", "2023-07-18T20:02:00.000Z");

  expectedParams.append("step", "2m");

  const { baseUrl, headers } = options;
  expect(mockedFetch).toHaveBeenCalledWith(
    `${baseUrl}/api/v1/query_range?${expectedParams.toString()}`,
    { mode: "cors", headers },
  );
});
