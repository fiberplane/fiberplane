pub use fiberplane_models::notebooks::{GraphType, StackingType};
pub use fiberplane_models::providers::{Metric, ProviderEvent, Timeseries};
pub use fiberplane_models::timestamps::{TimeRange, Timestamp};
use serde::Serialize;
use std::collections::BTreeMap;

/// All the data necessary to generate an abstract chart from an array of
/// timeseries.
pub struct TimeseriesSourceData<'source, 'slice> {
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
}

/// All the data necessary to generate an abstract chart from an array of
/// timeseries and an array of events.
///
/// Note we only support generating line charts from combined timeseries and
/// events data. If `graph_type` is anything other than [`GraphType::Line`],
/// the events will be ignored.
pub struct TimeseriesAndEventsSourceData<'source, 'slice> {
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
    pub events: &'slice [&'source ProviderEvent],

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
}

impl<'source> From<&'source Metric> for PointSource<'source> {
    fn from(value: &'source Metric) -> Self {
        Self::Metric(value)
    }
}

/// An abstract chart with information about what to render and where to render
/// it.
///
/// All coordinates in an abstract chart are normalized to run from 0.0 to 1.0,
/// so (0, 0) is the origin of the chart (typically rendered bottom left), while
/// (1, 0) is the end of the X axis and (0, 1) is the end of the Y axis.
///
/// The generic argument `S` refers to the type of the series from which shapes
/// will be generated, while the type `P` refers to the type for individual data
/// points. When generating charts from timeseries data, these will be
/// [Timeseries] and [Metric], respectively.
#[derive(Default, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AbstractChart<S, P> {
    pub x_axis: Axis,
    pub y_axis: Axis,
    pub shape_lists: Vec<ShapeList<S, P>>,
}

impl<'source> From<AbstractChart<&'source Timeseries, &'source Metric>>
    for AbstractChart<SeriesSource<'source>, PointSource<'source>>
{
    fn from(value: AbstractChart<&'source Timeseries, &'source Metric>) -> Self {
        Self {
            shape_lists: value.shape_lists.into_iter().map(ShapeList::into).collect(),
            x_axis: value.x_axis,
            y_axis: value.y_axis,
        }
    }
}

/// Defines the range of values that are displayed along a given axis.
#[derive(Default, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Axis {
    /// The value to display at the chart origin.
    pub min_value: f64,

    /// The value to display at the end of the axis.
    pub max_value: f64,

    /// Optional suggestion of where to draw ticks based on the detected bucket
    /// intervals.
    ///
    /// Ticks are expressed as values between `minValue` and `maxValue`.
    pub tick_suggestions: Option<Vec<f64>>,
}

impl Axis {
    /// Extends the range of the axis with the given interval.
    ///
    /// The range of the interval is divided among ends of the axis. This can be
    /// used to extend the axis with enough space to display the bars for the
    /// first and last buckets displayed on a bar chart.
    #[must_use]
    pub fn extend_with_interval(mut self, interval: f64) -> Self {
        let half_interval = 0.5 * interval;
        self.min_value -= half_interval;
        self.max_value += half_interval;
        self
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

/// List of shapes that belongs together.
///
/// These should be rendered in the same color.
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ShapeList<S, P> {
    pub shapes: Vec<Shape<P>>,

    /// The original source this shape list belongs to.
    ///
    /// This would be the type of input data the chart was generated from, such
    /// as [Timeseries].
    pub source: S,
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

#[derive(Serialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum Shape<P> {
    Area(Area<P>),
    Line(Line<P>),
    Point(Point<P>),
    Rectangle(Rectangle<P>),
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

/// An area to be drawn between two lines that share their X coordinates.
///
/// Area points move from left to right.
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Area<P> {
    pub points: Vec<AreaPoint<P>>,
}

impl<'source> From<Area<&'source Metric>> for Area<PointSource<'source>> {
    fn from(value: Area<&'source Metric>) -> Self {
        Self {
            points: value.points.into_iter().map(AreaPoint::into).collect(),
        }
    }
}

/// A single data point in an area shape.
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AreaPoint<P> {
    /// X coordinate between 0.0 and 1.0.
    pub x: f64,

    /// Y coordinate between 0.0 and 1.0 for the bottom of the area.
    pub y_min: f64,

    /// Y coordinate between 0.0 and 1.0 for the top of the area.
    pub y_max: f64,

    /// The source this point was generated from.
    ///
    /// This would be a [Metric] if the chart was generated from [Timeseries].
    pub source: P,
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

/// A line to be drawn between two or more points.
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Line<P> {
    pub points: Vec<Point<P>>,
}

impl<'source> From<Line<&'source Metric>> for Line<PointSource<'source>> {
    fn from(value: Line<&'source Metric>) -> Self {
        Self {
            points: value.points.into_iter().map(Point::into).collect(),
        }
    }
}

/// A single point in the chart.
///
/// Points can be rendered independently as a dot, or can be used to draw lines
/// between them.
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Point<P> {
    /// X coordinate between 0.0 and 1.0.
    pub x: f64,

    /// Y coordinate between 0.0 and 1.0.
    pub y: f64,

    /// The source this point was generated from.
    ///
    /// This would be a [Metric] if the chart was generated from [Timeseries].
    pub source: P,
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

/// A rectangle to be rendered inside the chart.
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Rectangle<P> {
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,

    /// The source this rectangle was generated from.
    ///
    /// This would be a [Metric] if the chart was generated from [Timeseries].
    pub source: P,
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
