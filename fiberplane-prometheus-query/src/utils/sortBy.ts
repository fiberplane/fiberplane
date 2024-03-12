/**
 * Sorts an array ascending by priority.
 *
 * *Warning:* As this function uses `Array#sort()` it also mutates the input
 * array.
 */
export function sortBy<T, U extends number | string>(
  array: Array<T>,
  getPriorityFn: (item: T) => U,
  reverse = false,
) {
  return array.sort((a, b) => {
    const priorityA = getPriorityFn(a);
    const priorityB = getPriorityFn(b);
    if (priorityA < priorityB) {
      return reverse === true ? 1 : -1;
    }
    if (priorityA > priorityB) {
      return reverse === true ? -1 : 1;
    }
    return 0;
  });
}
