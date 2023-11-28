use super::utils::*;
use crate::fiberplane::{PointSource, ProviderEvent, SeriesSource};
use crate::types::{Area, AreaPoint, Axis, Shape, ShapeList};

pub(crate) fn generate_shape_list_from_events<'source>(
    x_axis: &Axis,
    events: &[&'source ProviderEvent],
) -> ShapeList<SeriesSource<'source>, PointSource<'source>> {
    ShapeList {
        shapes: events
            .iter()
            .map(|event| {
                Shape::Area(Area {
                    area_gradient_shown: None,
                    points: vec![AreaPoint {
                        x: normalize_along_linear_axis(get_time_from_timestamp(event.time), x_axis),
                        y_min: 0.,
                        y_max: 1.,
                        source: PointSource::Event(event),
                    }],
                })
            })
            .collect(),
        source: SeriesSource::Events,
    }
}
