use super::constants::{TICK_FONT_FAMILY, TICK_FONT_SIZE, TICK_FONT_WEIGHT, TICK_LABEL_OFFSET};
use super::{ChartOptions, Scales};
use crate::chart_to_svg::tick_formatters::get_formatter_for_axis;
use crate::{Axis, MondrianChart};
use itertools::join;
use std::fmt::Write;

pub(super) fn generate_grid_and_axes_svg<S, P>(
    MondrianChart { x_axis, y_axis, .. }: &MondrianChart<S, P>,
    scales: &Scales,
    options: &ChartOptions<S>,
) -> String {
    let &Scales { x_max, y_max } = scales;

    let stroke_attrs = format_stroke_attrs(options);

    let x_scale = |value| scales.x(value);
    let y_scale = |value| scales.y(value);

    let x_ticks = get_ticks(x_axis, x_max, x_scale, 12, get_max_x_tick_value);
    let y_ticks = get_ticks(y_axis, y_max, y_scale, 8, get_max_y_tick_value);

    let mut svg = String::new();

    if options.grid_rows_shown {
        write_grid_rows_svg(&mut svg, x_max, y_axis, y_scale, &y_ticks, &stroke_attrs);
    }

    if options.grid_columns_shown {
        write_grid_columns_svg(&mut svg, x_axis, x_scale, &x_ticks, y_max, &stroke_attrs);
    }

    if options.axis_lines_shown || options.x_formatter.is_some() {
        write_x_axis_svg(&mut svg, scales, x_axis, &x_ticks, &stroke_attrs, options);
    }

    if options.axis_lines_shown || options.y_formatter.is_some() {
        write_y_axis_svg(&mut svg, scales, y_axis, &y_ticks, &stroke_attrs, options);
    }

    svg
}

fn write_grid_rows_svg(
    svg: &mut String,
    x_max: f64,
    y_axis: &Axis,
    y_scale: impl Fn(f64) -> f64,
    y_ticks: &[f64],
    stroke_attrs: &str,
) {
    svg.push_str("<g>");

    for &value in y_ticks {
        let y = y_scale((value - y_axis.min_value) / (y_axis.max_value - y_axis.min_value));
        write!(
            svg,
            "<line x1=\"0\" y1=\"{y:.1}\" x2=\"{x_max}\" y2=\"{y}\" {stroke_attrs} />"
        )
        .expect("Could not write grid row line");
    }

    svg.push_str("</g>");
}

fn write_grid_columns_svg(
    svg: &mut String,
    x_axis: &Axis,
    x_scale: impl Fn(f64) -> f64,
    x_ticks: &[f64],
    y_max: f64,
    stroke_attrs: &str,
) {
    svg.push_str("<g>");

    for &value in x_ticks {
        let x = x_scale((value - x_axis.min_value) / (x_axis.max_value - x_axis.min_value));
        write!(
            svg,
            "<line x1=\"{x:.1}\" y1=\"0\" x2=\"{x:.1}\" y2=\"{y_max}\" {stroke_attrs} />"
        )
        .expect("Could not write grid column line");
    }

    svg.push_str("</g>");
}

fn write_x_axis_svg<S>(
    svg: &mut String,
    scales: &Scales,
    x_axis: &Axis,
    x_ticks: &[f64],
    stroke_attrs: &str,
    options: &ChartOptions<S>,
) {
    let Scales { x_max, y_max } = scales;

    write!(svg, "<g transform=\"translate(0, {y_max})\">").expect("Could not write axis group");

    if options.axis_lines_shown {
        write!(
            svg,
            "<line x1=\"0\" y1=\"0\" x2=\"{x_max}\" y2=\"0\" {stroke_attrs} />"
        )
        .expect("Could not write axis line");
    }

    if let Some(formatter) = options
        .x_formatter
        .map(|formatter| get_formatter_for_axis(x_axis, formatter))
    {
        let tick_color = &options.tick_color;
        let tick_label_attrs = format!(
            "y=\"{TICK_FONT_SIZE}\" \
            dy=\"{TICK_LABEL_OFFSET}\" \
            fill=\"{tick_color}\" \
            font-family=\"{TICK_FONT_FAMILY}\" \
            font-size=\"{TICK_FONT_SIZE}\" \
            font-weight=\"{TICK_FONT_WEIGHT}\" \
            letter-spacing=\"0\" \
            text-anchor=\"middle\""
        );

        for &value in x_ticks {
            let label = formatter.format(value);
            let x = scales.x((value - x_axis.min_value) / (x_axis.max_value - x_axis.min_value));

            write!(svg, "<text x=\"{x:.1}\" {tick_label_attrs}>{label}</text>")
                .expect("Could not write tick");
        }
    }

    svg.push_str("</g>");
}

fn write_y_axis_svg<S>(
    svg: &mut String,
    scales: &Scales,
    y_axis: &Axis,
    y_ticks: &[f64],
    stroke_attrs: &str,
    options: &ChartOptions<S>,
) {
    let Scales { x_max, y_max, .. } = scales;

    svg.push_str("<g>");

    if options.axis_lines_shown {
        write!(
            svg,
            "<line x1=\"0\" y1=\"0\" x2=\"0\" y2=\"{y_max}\" {stroke_attrs} />\
            <line x1=\"{x_max}\" x2=\"{x_max}\" y1=\"0\" y2=\"{y_max}\" {stroke_attrs} />"
        )
        .expect("Could not write axis line");
    }

    if let Some(formatter) = options
        .y_formatter
        .map(|formatter| get_formatter_for_axis(y_axis, formatter))
    {
        let tick_color = &options.tick_color;
        let tick_label_attrs = format!(
            "dx=\"-0.45em\" \
            dy=\"0.25em\" \
            text-anchor=\"end\" \
            font-family=\"{TICK_FONT_FAMILY}\" \
            font-size=\"{TICK_FONT_SIZE}\" \
            font-weight=\"{TICK_FONT_WEIGHT}\" \
            letter-spacing=\"0\" \
            fill=\"{tick_color}\""
        );

        let num_ticks = y_ticks.len();
        for (index, &value) in y_ticks.iter().enumerate() {
            if value == 0. || index == 0 || index >= num_ticks - 1 {
                continue;
            }

            let label = formatter.format(value);
            let y = scales.y((value - y_axis.min_value) / (y_axis.max_value - y_axis.min_value));

            write!(
                svg,
                "<text x=\"0\" y=\"{y:.1}\" {tick_label_attrs}>{label}</text>"
            )
            .expect("Could not write tick");
        }
    }

    svg.push_str("</g>");
}

fn get_ticks(
    axis: &Axis,
    max: f64,
    scale: impl Fn(f64) -> f64,
    num_ticks: usize,
    get_max_allowed_tick: impl Fn(&[f64], f64) -> f64,
) -> Vec<f64> {
    let (mut ticks, interval) = if let Some(suggestions) = &axis.tick_suggestions {
        get_ticks_and_interval_from_suggestions(axis, suggestions, num_ticks)
    } else {
        get_ticks_and_interval_from_range(axis.min_value, axis.max_value, num_ticks)
    };

    if let Some(interval) = interval {
        extend_ticks_to_fit_axis(&mut ticks, axis, max, scale, 2 * num_ticks, interval);
    }

    remove_last_tick_if_too_close_to_max(&mut ticks, axis.max_value, get_max_allowed_tick);

    ticks
}

fn get_ticks_and_interval_from_range(
    min_value: f64,
    max_value: f64,
    num_ticks: usize,
) -> (Vec<f64>, Option<f64>) {
    let interval = (max_value - min_value) / num_ticks as f64;

    // NOTE - We need to handle the case where the interval is less than EPSILON,
    //        which is the smallest interval we can represent using floating point precision
    if interval < f64::EPSILON {
        return (vec![min_value, max_value], None);
    }

    let mut ticks = vec![min_value];
    let mut tick = min_value + interval;

    while tick < max_value {
        ticks.push(tick);
        tick += interval;
    }

    (ticks, Some(interval))
}

fn get_ticks_and_interval_from_suggestions(
    axis: &Axis,
    suggestions: &[f64],
    num_ticks: usize,
) -> (Vec<f64>, Option<f64>) {
    let len = suggestions.len();
    if len < 2 {
        return (suggestions.to_vec(), None);
    }

    let suggestion_interval = suggestions[1] - suggestions[0];
    let axis_range = axis.max_value - axis.min_value;
    let ticks_per_range = axis_range / suggestion_interval;
    if ticks_per_range < num_ticks as f64 {
        return (suggestions.to_vec(), Some(suggestion_interval));
    }

    let division_factor = (ticks_per_range / num_ticks as f64).ceil() as usize;
    let ticks = suggestions
        .iter()
        .enumerate()
        .filter(|(index, _)| index % division_factor == 0)
        .map(|(_, value)| *value)
        .collect();

    (ticks, Some(division_factor as f64 * suggestion_interval))
}

/// Extends the ticks to cover the full range of the axis.
///
/// Due to animations/translations it is possible the ticks don't yet cover the
/// full range of the axis. This function extends the ticks as necessary, and
/// also includes a slight margin to prevent a "pop-in" effect of suddenly
/// appearing tick labels from the right edge.
fn extend_ticks_to_fit_axis(
    ticks: &mut Vec<f64>,
    axis: &Axis,
    max: f64,
    scale: impl Fn(f64) -> f64,
    max_ticks: usize,
    interval: f64,
) {
    let scale_to_axis = |value| scale((value - axis.min_value) / (axis.max_value - axis.min_value));

    // Trim ticks from the start if the user has dragged them beyond the Y axis.
    while !ticks.is_empty() && scale_to_axis(ticks[0]) < 0. {
        ticks.remove(0);
    }

    let mut pre_tick = ticks
        .first()
        .map(|first_tick| first_tick - interval)
        .unwrap_or(f64::NAN);
    while ticks.len() < max_ticks && !pre_tick.is_nan() && scale_to_axis(pre_tick) >= 0. {
        ticks.insert(0, pre_tick);
        pre_tick -= interval;
    }

    let mut post_tick = ticks
        .last()
        .map(|last_tick| last_tick + interval)
        .unwrap_or(f64::NAN);
    while ticks.len() < max_ticks && !post_tick.is_nan() && scale_to_axis(post_tick) < 1.1 * max {
        ticks.push(post_tick);
        post_tick += interval;
    }
}

fn format_stroke_attrs<S>(
    ChartOptions {
        grid_stroke_color,
        grid_stroke_dasharray,
        ..
    }: &ChartOptions<S>,
) -> String {
    if grid_stroke_dasharray.is_empty() {
        format!("stroke=\"{grid_stroke_color}\"")
    } else {
        let dasharray = join(grid_stroke_dasharray.iter().map(f32::to_string), " ");
        format!("stroke=\"{grid_stroke_color}\" stroke-dasharray=\"{dasharray}\"")
    }
}

/// When rendering our svg charts, we want to avoid cutting off tick labels.
/// The way we can do this (simiar to visx's solution) is by not rendering
/// ticks, if they are too close to the axis's max value.
///
/// The definition of what is "too close" to the max value is determined by the
/// `get_max_allowed_tick` function.
fn remove_last_tick_if_too_close_to_max(
    ticks: &mut Vec<f64>,
    max_value: f64,
    get_max_allowed_tick: impl Fn(&[f64], f64) -> f64,
) {
    if ticks.len() < 2 {
        return;
    }

    let max_tick_value = get_max_allowed_tick(ticks, max_value);
    if ticks
        .last()
        .is_some_and(|&last_tick| last_tick > max_tick_value)
    {
        ticks.pop();
    }
}

/// Returns a maximum allowed tick value for the x-axis.
///
/// Heuristic:
///   If a tick's distance to the max_value is within 1/2 the size of the
///   tick-interval, the tick will get dropped.
///
/// Note that the heuristic was determined by trial and error.
fn get_max_x_tick_value(ticks: &[f64], max_value: f64) -> f64 {
    if ticks.len() < 2 {
        return max_value;
    }

    let interval = ticks[1] - ticks[0];
    max_value - interval / 2.
}

/// Returns a maximum allowed tick value for the x-axis.
///
/// Heuristic:
///   If a tick's distance to the max_value is within 1/3 the size of the
///   tick-interval, the tick will get dropped.
///
/// Note that the heuristic was determined by trial and error.
fn get_max_y_tick_value(ticks: &[f64], max_value: f64) -> f64 {
    if ticks.len() < 2 {
        return max_value;
    }

    let interval = ticks[1] - ticks[0];
    max_value - interval / 3.
}
