use std::fmt::Write;

/// Creates the SVG path definition for a line path.
///
/// `data` should contain the data points for the line.
/// `x`, `y` are a set of factories for producing X and Y coordinates for the
/// line.
///
/// See also: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d
pub(super) fn create_line_path_def<P>(
    data: &[P],
    x: impl Fn(&P) -> f64,
    y: impl Fn(&P) -> f64,
) -> String {
    let len = data.len();
    if len == 0 {
        return String::new();
    }

    let start = &data[0];
    let mut path = String::with_capacity(12 * data.len());
    write!(&mut path, "M{x:.1},{y:.1}", x = x(start), y = y(start))
        .expect("Could not format line path");

    // Draw a line along the y0 coordinates.
    for point in data.iter().skip(1) {
        write!(&mut path, "L{x:.1},{y:.1}", x = x(point), y = y(point))
            .expect("Could not format line path");
    }

    path
}
