mod image_renderer;

use crate::chart_to_svg::*;
use crate::AbstractChart;

pub use image_renderer::*;

/// Options for generating an image from a Mondrian chart.
pub struct ImageOptions {
    /// The file format to use for the generated image.
    pub format: ImageFormat,

    /// Background color to render the chart on, specified as a CSS color.
    pub background_color: String,
}

pub fn chart_to_image<S, P>(
    chart: &AbstractChart<S, P>,
    chart_options: ChartOptions,
    image_options: ImageOptions,
) -> Result<Vec<u8>, ImageRenderingError> {
    let renderer = ImageRenderer::new(chart_options);
    renderer.render_format(chart, image_options)
}
