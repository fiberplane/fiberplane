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
    let mut path = format!("M{x:.1},{y:.1}", x = x(start), y = y(start));

    // Draw a line along the y0 coordinates.
    let mut i = 1;
    while i < len {
        let next = &data[i];
        path.push_str(&format!("L{x:.1},{y:.1}", x = x(next), y = y(next)));
        i += 1;
    }

    path
}
