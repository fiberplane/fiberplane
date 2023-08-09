use super::create_area_path_def::create_area_path_def;
use super::create_line_path_def::create_line_path_def;
use super::{ChartOptions, Scales, POINT_RADIUS};
use crate::types::{Area, Line, MondrianChart, Point, Rectangle, Shape};
use itertools::join;
use std::borrow::Cow;

pub(super) fn generate_chart_content_svg<'a, S, P>(
    chart: &'a MondrianChart<S, P>,
    scales: &Scales,
    options: &ChartOptions<'a, S>,
) -> String {
    let shapes = chart
        .shape_lists
        .iter()
        .enumerate()
        .flat_map(|(index, shape_list)| {
            shape_list.shapes.iter().map(move |shape| {
                generate_shape_svg(
                    shape,
                    scales,
                    ShapeOptions::from_chart_options_with_shape_list_index(
                        &shape_list.source,
                        options,
                        index,
                    ),
                )
            })
        });

    join(shapes, "")
}

struct ShapeOptions<'a> {
    area_gradient_shown: bool,
    color: &'a str,
    index: usize,
}

impl<'a> ShapeOptions<'a> {
    fn from_chart_options_with_shape_list_index<S>(
        source: &'a S,
        options: &ChartOptions<'a, S>,
        index: usize,
    ) -> Self {
        let ChartOptions {
            area_gradient_shown,
            get_shape_list_color,
            ..
        } = options;

        Self {
            area_gradient_shown: *area_gradient_shown,
            color: get_shape_list_color(source, index),
            index,
        }
    }
}

fn generate_shape_svg<P>(shape: &Shape<P>, scales: &Scales, options: ShapeOptions) -> String {
    match shape {
        Shape::Area(area) => generate_area_svg(area, scales, options),
        Shape::Line(line) => generate_line_svg(line, scales, options),
        Shape::Point(point) => generate_point_svg(point, scales, options),
        Shape::Rectangle(rectangle) => generate_rectangle_svg(rectangle, scales, options),
    }
}

fn generate_area_svg<P>(area: &Area<P>, scales: &Scales, options: ShapeOptions) -> String {
    let ShapeOptions {
        area_gradient_shown,
        color,
        index,
    } = options;

    let (defs, fill) = if area_gradient_shown {
        let defs = format!(
            "<defs>\
                <linearGradient id=\"line-{index}\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">\
                    <stop offset=\"0%\" stop-color=\"{color}\" stop-opacity=\"0.3\" />\
                    <stop offset=\"80%\" stop-color=\"{color}\" stop-opacity=\"0.06\" />\
                </linearGradient>\
            </defs>"
        );

        (Cow::Owned(defs), Cow::Owned(format!("url(#line-{index})")))
    } else {
        (Cow::Borrowed(""), Cow::Borrowed("none"))
    };

    let path_def = create_area_path_def(
        &area.points,
        |point| scales.x(point.x),
        |point| scales.y(point.y_min),
        |point| scales.y(point.y_max),
    );

    format!(r#"{defs}<path d="{path_def}" stroke="{color}" stroke-width="1" fill="{fill}" />"#)
}

fn generate_line_svg<P>(line: &Line<P>, scales: &Scales, options: ShapeOptions) -> String {
    let ShapeOptions {
        area_gradient_shown,
        color,
        index,
    } = options;

    let gradient = if area_gradient_shown {
        let path_def = create_area_path_def(
            &line.points,
            |point| scales.x(point.x),
            |point| scales.y(point.y),
            |_| scales.y(0.),
        );

        Cow::Owned(format!(
            "<defs>\
                <linearGradient id=\"line-{index}\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">\
                    <stop offset=\"0%\" stop-color=\"{color}\" stop-opacity=\"0.15\" />\
                    <stop offset=\"23%\" stop-color=\"{color}\" stop-opacity=\"0.03\" />\
                </linearGradient>\
            </defs>\
            <path d=\"{path_def}\" stroke=\"none\" fill=\"url(#line-{index})\" />"
        ))
    } else {
        Cow::Borrowed("")
    };

    let path_def = create_line_path_def(
        &line.points,
        |point| scales.x(point.x),
        |point| scales.y(point.y),
    );

    format!(r#"{gradient}<path d="{path_def}" stroke="{color}" stroke-width="1" fill="none" />"#)
}

fn generate_point_svg<P>(point: &Point<P>, scales: &Scales, options: ShapeOptions) -> String {
    let ShapeOptions { color, .. } = options;

    format!(
        r#"<circle cx="{x:.1}" cy="{y:.1}" r="{POINT_RADIUS}" stroke="{color}" fill="{color}" />"#,
        x = scales.x(point.x),
        y = scales.y(point.y)
    )
}

fn generate_rectangle_svg<P>(
    rectangle: &Rectangle<P>,
    scales: &Scales,
    options: ShapeOptions,
) -> String {
    let ShapeOptions { color, .. } = options;
    let height = rectangle.height * scales.y_max;
    let width = rectangle.width * scales.x_max;

    format!(
        "<rect \
            x=\"{x:.1}\" \
            y=\"{y:.1}\" \
            width=\"{width:.1}\" \
            height=\"{height:.1}\" \
            stroke=\"{color}\" \
            fill=\"{color}\" \
            fill-opacity=\"0.1\" \
            opacity=\"1\" \
        />",
        x = scales.x(rectangle.x),
        y = scales.y(rectangle.y) - height
    )
}
