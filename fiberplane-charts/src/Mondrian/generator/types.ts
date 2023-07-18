/**
 * A map that holds arbitrary values per timestamp.
 *
 * The keys in the map represent timestamps, while the values are generic and
 * are calculated over all the metrics matching that timestamp.
 */
export type Buckets<T> = Map<string, T>;

/**
 * Represents the minimum and maximum values inside a series of numbers.
 */
export type MinMax = [min: number, max: number];

export type StackedChartBuckets = Buckets<StackedChartBucketValue>;

export type StackedChartBucketValue = {
  /**
   * Used to keep track of how much a bucket is "filled" while calculating the
   * area shapes.
   */
  currentY: number;

  /**
   * The sum of all values in the bucket.
   */
  total: number;
};
