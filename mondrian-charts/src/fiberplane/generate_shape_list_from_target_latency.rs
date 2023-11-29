use super::utils::*;
use crate::fiberplane::{PointSource, SeriesSource};
use crate::types::{Axis, Shape, ShapeList};
use crate::{Line, Point};

/// Generates a shape list with a single line from a fixed target latency.
pub(crate) fn generate_shape_list_from_target_latency<'source>(
    y_axis: &Axis,
    value: f64,
) -> ShapeList<SeriesSource<'source>, PointSource<'source>> {
    ShapeList {
        shapes: vec![Shape::Line(Line {
            area_gradient_shown: Some(false),
            points: vec![
                Point {
                    x: 0.,
                    y: normalize_along_linear_axis(value, y_axis),
                    source: PointSource::None,
                },
                Point {
                    x: 1.,
                    y: normalize_along_linear_axis(value, y_axis),
                    source: PointSource::None,
                },
            ],
        })],
        source: SeriesSource::TargetLatency,
    }
}
