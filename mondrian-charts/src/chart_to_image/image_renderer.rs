// Based on: https://raw.githubusercontent.com/yuankunzhang/charming/main/charming/src/renderer/image_renderer.rs
// License: MIT/Apache 2

use crate::{chart_to_svg, ChartOptions, ImageOptions, MondrianChart};
use image::RgbaImage;
use resvg::tiny_skia::{Color, Pixmap};
use resvg::usvg::{self, TreeTextToPath};
use std::io::Cursor;
use thiserror::Error;

pub use image::{ImageError, ImageFormat};

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
    #[error("{0}")]
    Other(String),
}

pub struct ImageRenderer {
    fontdb: usvg::fontdb::Database,
    options: ChartOptions,
}

impl ImageRenderer {
    pub fn new(options: ChartOptions) -> Self {
        let mut fontdb = usvg::fontdb::Database::default();
        fontdb.load_system_fonts();

        #[cfg(all(unix, not(any(target_os = "macos", target_os = "android"))))]
        {
            set_default_fonts(&mut fontdb);
        }

        Self { fontdb, options }
    }

    /// Render a chart to a given image format in bytes.
    pub fn render_format<S, P>(
        &self,
        chart: &MondrianChart<S, P>,
        options: ImageOptions,
    ) -> Result<Vec<u8>, ImageRenderingError> {
        let background_color = parse_color(&options.background_color)?;

        let svg = chart_to_svg(chart, &self.options);

        let img = self.render_svg_to_buf(&svg, background_color)?;

        // give buf initial capacity of: width * height * num of channels for RGBA + room for headers/metadata
        let estimated_capacity =
            self.options.width as usize * self.options.height as usize * 4 + 1024;
        let mut buf = Vec::with_capacity(estimated_capacity);
        img.write_to(&mut Cursor::new(&mut buf), options.format)
            .map_err(ImageRenderingError::ImageError)?;
        Ok(buf)
    }

    /// Given an SVG string, render it into an [`image::ImageBuffer`].
    fn render_svg_to_buf(
        &self,
        svg: &str,
        background_color: Color,
    ) -> Result<image::RgbaImage, ImageRenderingError> {
        let ChartOptions { width, height, .. } = self.options;

        let mut pixels = Pixmap::new(width as u32, height as u32)
            .ok_or(ImageRenderingError::InvalidDimensions)?;
        pixels.fill(background_color);

        let mut tree: usvg::Tree =
            usvg::TreeParsing::from_data(svg.as_bytes(), &usvg::Options::default())
                .map_err(|error| ImageRenderingError::InvalidSvg(error.to_string()))?;

        tree.convert_text(&self.fontdb);
        resvg::Tree::from_usvg(&tree).render(usvg::Transform::identity(), &mut pixels.as_mut());

        let img = RgbaImage::from_vec(width as u32, height as u32, pixels.take()).ok_or(
            ImageRenderingError::Other("Could not create ImageBuffer from bytes".to_owned()),
        )?;

        Ok(img)
    }
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

#[cfg(all(unix, not(any(target_os = "macos", target_os = "android"))))]
fn set_default_fonts(fontdb: &mut usvg::fontdb::Database) {
    let sans_serif_fonts = ["Inter"];
    let serif_fonts = [];
    let monospace_fonts = [];

    for font in sans_serif_fonts {
        if font_exists(fontdb, font) {
            fontdb.set_sans_serif_family(font);
            break;
        }
    }

    for font in serif_fonts {
        if font_exists(fontdb, font) {
            fontdb.set_serif_family(font);
            break;
        }
    }

    for font in monospace_fonts {
        if font_exists(fontdb, font) {
            fontdb.set_monospace_family(font);
            break;
        }
    }
}

#[cfg(all(unix, not(any(target_os = "macos", target_os = "android"))))]
fn font_exists(fontdb: &usvg::fontdb::Database, family: &str) -> bool {
    fontdb
        .query(&usvg::fontdb::Query {
            families: &[usvg::fontdb::Family::Name(family)],
            weight: usvg::fontdb::Weight(14),
            stretch: usvg::fontdb::Stretch::Normal,
            style: usvg::fontdb::Style::Normal,
        })
        .is_some()
}
