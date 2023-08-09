mod constants;
mod create_area_path_def;
mod create_line_path_def;
mod generate_chart_content_svg;
mod generate_grid_with_axes_svg;
mod scales;
mod tick_formatters;

use crate::MondrianChart;
use constants::*;
use generate_chart_content_svg::generate_chart_content_svg;
use generate_grid_with_axes_svg::generate_grid_with_axes_svg;
use scales::Scales;
use std::borrow::Cow;

pub use self::tick_formatters::FormatterKind;

pub struct ChartOptions<'a, S> {
    pub width: u16,
    pub height: u16,

    pub area_gradient_shown: bool,
    pub grid_borders_shown: bool,
    pub grid_shown: bool,
    pub grid_stroke_color: String,
    pub grid_stroke_dasharray: Vec<f32>,
    pub get_shape_list_color: &'a dyn Fn(&'a S, usize) -> &'a str,
    pub tick_color: String,
    pub x_formatter: FormatterKind,
    pub y_formatter: FormatterKind,
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

    let grid = if options.grid_shown {
        Cow::Owned(generate_grid_with_axes_svg(chart, &scales, options))
    } else {
        Cow::Borrowed("")
    };

    let chart_content = generate_chart_content_svg(chart, &scales, options);

    format!(
        "<svg xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\" width=\"{width}\" height=\"{height}\">\
            <defs>\
                <clipPath id=\"{clip_path_id}\">\
                  <rect x=\"0\" y=\"{clip_path_y_start}\" width=\"{x_max}\" height=\"{clip_path_height}\" />\
                </clipPath>\
            </defs>\
            <g transform=\"translate({MARGIN_LEFT}, {MARGIN_TOP})\">\
              {grid}\
              <g clip-path=\"url(#{clip_path_id})\">{chart_content}</g>\
            </g>\
        </svg>"
    )
}
