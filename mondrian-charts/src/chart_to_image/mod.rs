mod image_renderer;

use crate::chart_to_svg::*;
use crate::AbstractChart;

pub use image_renderer::*;

pub fn chart_to_image<S, P>(
    chart: &AbstractChart<S, P>,
    chart_options: ChartOptions,
    image_format: ImageFormat,
) -> Result<Vec<u8>, ImageRenderingError> {
    let renderer = ImageRenderer::new(chart_options);
    renderer.render_format(image_format, chart)
}
