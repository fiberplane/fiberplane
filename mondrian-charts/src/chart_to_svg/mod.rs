mod constants;
mod create_area_path_def;
mod create_line_path_def;
mod generate_chart_content_svg;
mod generate_grid_and_axes_svg;
mod scales;
mod tick_formatters;

use crate::MondrianChart;
use constants::*;
use generate_chart_content_svg::generate_chart_content_svg;
use generate_grid_and_axes_svg::generate_grid_and_axes_svg;
use scales::Scales;

pub use self::tick_formatters::FormatterKind;

/// Options used for rendering charts.
pub struct ChartOptions<'a, S> {
    /// The width the chart should be rendered as.
    pub width: u16,

    /// The height the chart should be rendered as.
    pub height: u16,

    /// Whether an area gradient should be rendered inside area shapes and below
    /// line shapes.
    pub area_gradient_shown: bool,

    /// Whether lines should be rendered along the axes.
    pub axis_lines_shown: bool,

    /// Whether grid lines should be rendered along the ticks on the X axis.
    pub grid_columns_shown: bool,

    /// Whether grid lines should be rendered along the ticks on the Y axis.
    pub grid_rows_shown: bool,

    /// The color to use for rendering grid lines along the ticks.
    ///
    /// Must be a valid CSS color string.
    pub grid_stroke_color: &'a str,

    /// Optional dasharray to apply to the grid lines.
    pub grid_stroke_dasharray: &'a [f32],

    /// Callback to determine the color that should be used for a given shape
    /// list.
    ///
    /// Shape lists are identified by the source, of type `S`, from which they
    /// are generated and their index in the list of shape lists.
    ///
    /// The returned color must be a valid CSS color string.
    pub get_shape_list_color: &'a dyn Fn(&'a S, usize) -> &'a str,

    /// The color to use for rendering ticks along the axes.
    ///
    /// Must be a valid CSS color string.
    pub tick_color: &'a str,

    /// The type of formatter to use for ticks along the X axis.
    ///
    /// If `None`, no ticks are shown along the X axis.
    pub x_formatter: Option<FormatterKind>,

    /// The type of formatter to use for ticks along the Y axis.
    ///
    /// If `None`, no ticks are shown along the Y axis.
    pub y_formatter: Option<FormatterKind>,
}

pub fn chart_to_svg<'a, S, P>(
    chart: &'a MondrianChart<S, P>,
    options: &ChartOptions<'a, S>,
) -> String {
    let ChartOptions { width, height, .. } = options;

    let x_max = width - MARGIN_LEFT - MARGIN_RIGHT;
    let y_max = height - MARGIN_TOP - MARGIN_BOTTOM;

    let scales = Scales::new(x_max as f64, y_max as f64);

    let clip_path_id = "clip-path";
    let clip_path_y_start = -(CHART_SHAPE_OVERFLOW_MARGIN as i32);
    let clip_path_height = y_max + 2 * CHART_SHAPE_OVERFLOW_MARGIN;

    let grid_and_axes = generate_grid_and_axes_svg(chart, &scales, options);
    let chart_content = generate_chart_content_svg(chart, &scales, options);

    format!(
        "<svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" width=\"{width}\" height=\"{height}\">\
            <defs>\
                <clipPath id=\"{clip_path_id}\">\
                  <rect x=\"0\" y=\"{clip_path_y_start}\" width=\"{x_max}\" height=\"{clip_path_height}\" />\
                </clipPath>\
            </defs>\
            <g transform=\"translate({MARGIN_LEFT}, {MARGIN_TOP})\">\
              {grid_and_axes}\
              <g clip-path=\"url(#{clip_path_id})\">{chart_content}</g>\
            </g>\
        </svg>"
    )
}
