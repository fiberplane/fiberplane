use crate::{chart_to_svg, ChartOptions, MondrianChart};
use image::{EncodableLayout, RgbaImage};
use resvg::tiny_skia::{BlendMode, Color, FilterQuality, Pixmap, PixmapPaint};
use resvg::usvg::{self, Transform, TreeTextToPath};
use std::io::Cursor;
use thiserror::Error;

pub use image::{ImageError, ImageFormat};
pub use resvg::usvg::fontdb;

#[derive(Debug, Error)]
pub enum ImageRenderingError {
    #[error("Error writing the image format")]
    ImageError(ImageError),
    #[error("Invalid color string")]
    InvalidColor { color: String },
    #[error("Could not create a buffer for the given image dimensions")]
    InvalidDimensions,
    #[error("SVG representation was invalid")]
    InvalidSvg(String),
    #[error("Error reading the watermark image")]
    WatermarkDecodingError(String),
    #[error("{0}")]
    Other(String),
}

/// Options for generating an image from a Mondrian chart.
pub struct ImageOptions<'a> {
    /// The font database that should be used for rendering ticks.
    ///
    /// Currently, only the `sans-serif` font needs to be initialized.
    pub fonts: fontdb::Database,

    /// The file format to use for the generated image.
    pub format: ImageFormat,

    /// Background color to render the chart on, specified as a CSS color.
    pub background_color: String,

    /// Binary image that should be applied to the top-right corner as a
    /// watermark.
    ///
    /// Only PNG images are supported for now.
    pub watermark_image: Option<&'a [u8]>,
}

pub fn chart_to_image<'a, S, P>(
    chart: &'a MondrianChart<S, P>,
    chart_options: &ChartOptions<'a, S>,
    image_options: &ImageOptions,
) -> Result<Vec<u8>, ImageRenderingError> {
    let svg = chart_to_svg(chart, chart_options);

    let image = render_svg_to_buffer(&svg, chart_options, image_options)?;

    // Give the buffer an initial capacity that matches the raw image size. This
    // probably allocates more memory than necessary, but it's better than
    // growing the buffer many times.
    let mut buffer = Vec::with_capacity(image.as_bytes().len());
    image
        .write_to(&mut Cursor::new(&mut buffer), image_options.format)
        .map_err(ImageRenderingError::ImageError)?;

    Ok(buffer)
}

fn render_svg_to_buffer<S>(
    svg: &str,
    chart_options: &ChartOptions<S>,
    image_options: &ImageOptions,
) -> Result<image::RgbaImage, ImageRenderingError> {
    let &ChartOptions { width, height, .. } = chart_options;

    let background_color = parse_color(&image_options.background_color)?;
    let mut pixels =
        Pixmap::new(width as u32, height as u32).ok_or(ImageRenderingError::InvalidDimensions)?;
    pixels.fill(background_color);

    let mut tree: usvg::Tree =
        usvg::TreeParsing::from_data(svg.as_bytes(), &usvg::Options::default())
            .map_err(|error| ImageRenderingError::InvalidSvg(error.to_string()))?;

    tree.convert_text(&image_options.fonts);
    resvg::Tree::from_usvg(&tree).render(usvg::Transform::identity(), &mut pixels.as_mut());

    if let Some(watermark) = image_options.watermark_image {
        let watermark = Pixmap::decode_png(watermark)
            .map_err(|err| ImageRenderingError::WatermarkDecodingError(err.to_string()))?;

        let paint = PixmapPaint {
            blend_mode: BlendMode::Plus,
            opacity: 0.2,
            quality: FilterQuality::Bilinear,
        };
        pixels.draw_pixmap(
            pixels.width() as i32 - watermark.width() as i32,
            0,
            watermark.as_ref(),
            &paint,
            Transform::default(),
            None,
        );
    }

    let img = RgbaImage::from_vec(width as u32, height as u32, pixels.take()).ok_or(
        ImageRenderingError::Other("Could not create ImageBuffer from bytes".to_owned()),
    )?;

    Ok(img)
}

fn parse_color(string: &str) -> Result<Color, ImageRenderingError> {
    csscolorparser::parse(string)
        .ok()
        .and_then(|csscolorparser::Color { r, g, b, a }| {
            Color::from_rgba(r as f32, g as f32, b as f32, a as f32)
        })
        .ok_or_else(|| ImageRenderingError::InvalidColor {
            color: string.to_owned(),
        })
}
