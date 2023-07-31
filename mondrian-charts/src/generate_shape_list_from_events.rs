use super::utils::*;
use crate::types::{
    Area, AreaPoint, Axis, PointSource, ProviderEvent, SeriesSource, Shape, ShapeList,
};

pub(crate) fn generate_shape_list_from_events<'source>(
    axis: &Axis,
    events: &[&'source ProviderEvent],
) -> ShapeList<SeriesSource<'source>, PointSource<'source>> {
    ShapeList {
        shapes: events
            .iter()
            .map(|event| {
                Shape::Area(Area {
                    points: vec![AreaPoint {
                        x: normalize_along_linear_axis(get_time_from_timestamp(event.time), axis),
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
