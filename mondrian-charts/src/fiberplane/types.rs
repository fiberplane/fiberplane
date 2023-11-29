use crate::types::*;
pub use fiberplane_models::notebooks::{GraphType, StackingType};
pub use fiberplane_models::providers::{Metric, ProviderEvent, Timeseries};
pub use fiberplane_models::timestamps::{TimeRange, Timestamp};
use serde::Serialize;
use std::collections::BTreeMap;

/// All the data necessary to generate an abstract chart from an array of
/// timeseries.
pub struct TimeseriesSourceData<'source, 'slice, 'value> {
    /// The type of chart to display.
    pub graph_type: GraphType,

    /// The type of stacking to apply to the chart.
    pub stacking_type: StackingType,

    /// Array of timeseries data to display in the chart.
    ///
    /// Make sure the timeseries contains data for the given time range, or you
    /// may not see any results.
    pub timeseries_data: &'slice [&'source Timeseries],

    /// The time range to be displayed.
    pub time_range: TimeRange,

    /// Additional values that will be plotted on the chart, but which are not
    /// part of any timeseries. These are not plotted, but are taken into
    /// account when deciding the range of the Y axis.
    pub additional_values: &'value [f64],
}

/// All the data necessary to generate an abstract chart from a combination of
/// timeseries data, events and an optional target latency.
pub struct CombinedSourceData<'source, 'slice> {
    /// The type of stacking to apply to the chart.
    ///
    /// **Warning:** This property is accepted for consistency, but setting it
    /// to anything except [GraphType::Line] will cause the events to be
    /// ignored.
    pub graph_type: GraphType,

    /// The type of stacking to apply to the chart.
    pub stacking_type: StackingType,

    /// Array of timeseries data to display in the chart.
    ///
    /// Make sure the timeseries contains data for the given time range, or you
    /// may not see any results.
    pub timeseries_data: &'slice [&'source Timeseries],

    /// Array of events to display in the chart.
    ///
    /// Note that events will not be displayed if the `graph_type` is anything
    /// other than [`GraphType::Line`].
    pub events: &'slice [&'source ProviderEvent],

    /// Optional target latency to display on the chart, in seconds.
    pub target_latency: Option<f64>,

    /// The time range to be displayed.
    pub time_range: TimeRange,
}

/// Source type for series in charts that contain combined data sources.
#[derive(Serialize)]
#[non_exhaustive]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum SeriesSource<'source> {
    Timeseries(&'source Timeseries),
    Events,
    TargetLatency,
}

impl<'source> From<&'source Timeseries> for SeriesSource<'source> {
    fn from(value: &'source Timeseries) -> Self {
        Self::Timeseries(value)
    }
}

/// Source type for points in charts that contain combined data sources.
#[derive(Serialize)]
#[non_exhaustive]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum PointSource<'source> {
    Metric(&'source Metric),
    Event(&'source ProviderEvent),
    None,
}

impl<'source> From<&'source Metric> for PointSource<'source> {
    fn from(value: &'source Metric) -> Self {
        Self::Metric(value)
    }
}

impl<'source> From<MondrianChart<&'source Timeseries, &'source Metric>>
    for MondrianChart<SeriesSource<'source>, PointSource<'source>>
{
    fn from(value: MondrianChart<&'source Timeseries, &'source Metric>) -> Self {
        Self {
            shape_lists: value.shape_lists.into_iter().map(ShapeList::into).collect(),
            x_axis: value.x_axis,
            y_axis: value.y_axis,
        }
    }
}

/// A map that holds arbitrary values per timestamp.
///
/// The keys in the map represent timestamps, while the values are generic and
/// are calculated over all the metrics matching that timestamp.
pub(crate) type Buckets<T> = BTreeMap<Timestamp, T>;

/// Represents the minimum and maximum values inside a series of numbers.
#[derive(Clone, Copy)]
pub(crate) struct MinMax(pub f64, pub f64);

impl MinMax {
    pub fn from_value(value: f64) -> Self {
        Self(value, value)
    }

    #[must_use]
    pub fn extend_with_other(mut self, other: Self) -> Self {
        if other.0 < self.0 {
            self.0 = other.0;
        }
        if other.1 > self.1 {
            self.1 = other.1;
        }

        self
    }

    #[must_use]
    pub fn extend_with_value(mut self, value: f64) -> Self {
        if value < self.0 {
            self.0 = value;
        } else if value > self.1 {
            self.1 = value;
        }

        self
    }
}

impl<'source> From<ShapeList<&'source Timeseries, &'source Metric>>
    for ShapeList<SeriesSource<'source>, PointSource<'source>>
{
    fn from(value: ShapeList<&'source Timeseries, &'source Metric>) -> Self {
        Self {
            shapes: value.shapes.into_iter().map(Shape::into).collect(),
            source: value.source.into(),
        }
    }
}

impl<'source> From<Shape<&'source Metric>> for Shape<PointSource<'source>> {
    fn from(other: Shape<&'source Metric>) -> Self {
        match other {
            Shape::Area(area) => Shape::Area(area.into()),
            Shape::Line(line) => Shape::Line(line.into()),
            Shape::Point(point) => Shape::Point(point.into()),
            Shape::Rectangle(rectangle) => Shape::Rectangle(rectangle.into()),
        }
    }
}

impl<'source> From<Area<&'source Metric>> for Area<PointSource<'source>> {
    fn from(value: Area<&'source Metric>) -> Self {
        Self {
            area_gradient_shown: None,
            points: value.points.into_iter().map(AreaPoint::into).collect(),
        }
    }
}

impl<'source> From<AreaPoint<&'source Metric>> for AreaPoint<PointSource<'source>> {
    fn from(value: AreaPoint<&'source Metric>) -> Self {
        Self {
            x: value.x,
            y_min: value.y_min,
            y_max: value.y_max,
            source: value.source.into(),
        }
    }
}

impl<'source> From<Line<&'source Metric>> for Line<PointSource<'source>> {
    fn from(value: Line<&'source Metric>) -> Self {
        Self {
            area_gradient_shown: None,
            points: value.points.into_iter().map(Point::into).collect(),
        }
    }
}

impl<'source> From<Point<&'source Metric>> for Point<PointSource<'source>> {
    fn from(value: Point<&'source Metric>) -> Self {
        Self {
            x: value.x,
            y: value.y,
            source: value.source.into(),
        }
    }
}

impl<'source> From<Rectangle<&'source Metric>> for Rectangle<PointSource<'source>> {
    fn from(value: Rectangle<&'source Metric>) -> Self {
        Self {
            x: value.x,
            y: value.y,
            width: value.width,
            height: value.height,
            source: value.source.into(),
        }
    }
}

pub(crate) type StackedChartBuckets = Buckets<StackedChartBucketValue>;

#[derive(Clone, Copy, Default)]
pub(crate) struct StackedChartBucketValue {
    /// Used to keep track of how much a bucket is "filled" while calculating
    /// the area shapes.
    pub current_y: f64,

    /// The sum of all values in the bucket.
    pub total: f64,
}
