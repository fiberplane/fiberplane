/// Creates the SVG path definition for an area shape.
///
/// `data` should contain the data points for the area.
/// `x`, `y0` and `y1` are a set of factories for producing X and Y coordinates
/// for an area shape.
///
/// The restriction for an area path is that every data point must produce two
/// coordinates for the Y axis, and one coordinate for the X axis.
///
/// See also: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/d
pub(super) fn create_area_path_def<P>(
    data: &[P],
    x: impl Fn(&P) -> f64,
    y0: impl Fn(&P) -> f64,
    y1: impl Fn(&P) -> f64,
) -> String {
    let len = data.len();
    if len == 0 {
        return String::new();
    }

    let start = &data[0];
    let mut path = format!("M{x:.1},{y:.1}", x = x(start), y = y0(start));

    // Draw a line along the y0 coordinates.
    let mut i = 1;
    while i < len {
        let next = &data[i];
        path.push_str(&format!("L{x:.1},{y:.1}", x = x(next), y = y0(next)));
        i += 1;
    }

    // Draw a line backwards along the y1 coordinates.
    i = len - 1;
    loop {
        let prev = &data[i];
        path.push_str(&format!("L{x:.1},{y:.1}", x = x(prev), y = y1(prev)));
        if i == 0 {
            break;
        } else {
            i -= 1;
        }
    }

    // Done.
    path.push('Z');
    path
}
