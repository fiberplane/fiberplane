use std::collections::BTreeMap;

pub use fiberplane_models::notebooks::{GraphType, StackingType};
pub use fiberplane_models::providers::{Metric, ProviderEvent, Timeseries};
pub use fiberplane_models::timestamps::{TimeRange, Timestamp};

/// All the data necessary to generate an abstract chart from an array of
/// timeseries.
pub struct TimeseriesSourceData {
    /// The type of chart to display.
    pub graph_type: GraphType,

    /// The type of stacking to apply to the chart.
    pub stacking_type: StackingType,

    /// Array of timeseries data to display in the chart.
    ///
    /// Make sure the timeseries contains data for the given time range, or you
    /// may not see any results.
    pub timeseries_data: Vec<Timeseries>,

    /// The time range to be displayed.
    pub time_range: TimeRange,
}

/// All the data necessary to generate an abstract chart from an array of
/// timeseries and an array of events.
///
/// Note we only support generating line charts from combined timeseries and
/// events data. If `graph_type` is anything other than [`GraphType::Line`],
/// the events will be ignored.
pub struct TimeseriesAndEventsSourceData {
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
    pub timeseries_data: Vec<Timeseries>,

    /// Array of events to display in the chart.
    pub events: Vec<ProviderEvent>,

    /// The time range to be displayed.
    pub time_range: TimeRange,
}

/// Source type for series in charts that contain combined data sources.
pub enum SeriesSource {
    Timeseries(Timeseries),
    Events,
}

/// Source type for points in charts that contain combined data sources.
pub enum PointSource {
    Metric(Metric),
    Event(ProviderEvent),
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
#[derive(Default)]
pub struct AbstractChart<S, P> {
    pub x_axis: Axis,
    pub y_axis: Axis,
    pub shape_lists: Vec<ShapeList<S, P>>,
}

/// Defines the range of values that are displayed along a given axis.
#[derive(Default)]
pub struct Axis {
    /// The value to display at the chart origin.
    pub min_value: f32,

    /// The value to display at the end of the axis.
    pub max_value: f32,

    /// Optional suggestion of where to draw ticks based on the detected bucket
    /// intervals.
    ///
    /// Ticks are expressed as values between `minValue` and `maxValue`.
    pub tick_suggestions: Option<Vec<f32>>,
}

impl Axis {
    /// Extends the range of the axis with the given interval.
    ///
    /// The range of the interval is divided among ends of the axis. This can be
    /// used to extend the axis with enough space to display the bars for the
    /// first and last buckets displayed on a bar chart.
    pub fn extend_with_interval(&mut self, interval: f32) {
        let half_interval = 0.5 * interval;
        self.min_value -= half_interval;
        self.max_value += half_interval;
    }
}

/// A map that holds arbitrary values per timestamp.
///
/// The keys in the map represent timestamps, while the values are generic and
/// are calculated over all the metrics matching that timestamp.
pub(crate) type Buckets<T> = BTreeMap<Timestamp, T>;

/// Represents the minimum and maximum values inside a series of numbers.
#[derive(Clone, Copy)]
pub(crate) struct MinMax(pub f32, pub f32);

impl MinMax {
    pub fn from_value(value: f32) -> Self {
        Self(value, value)
    }

    pub fn extend_with_other(mut self, other: Self) -> Self {
        if other.0 < self.0 {
            self.0 = other.0;
        }
        if other.1 > self.1 {
            self.1 = other.1;
        }

        self
    }

    pub fn extend_with_value(mut self, value: f32) -> Self {
        if value < self.0 {
            self.0 = value;
        } else if value > self.1 {
            self.1 = value;
        }

        self
    }

    pub fn max(&self) -> f32 {
        self.1
    }

    pub fn min(&self) -> f32 {
        self.0
    }
}

/// List of shapes that belongs together.
///
/// These should be rendered in the same color.
pub struct ShapeList<S, P> {
    shapes: Vec<Shape<P>>,

    /// The original source this shape list belongs to.
    ///
    /// This would be the type of input data the chart was generated from, such
    /// as [Timeseries].
    source: S,
}

pub enum Shape<P> {
    Area(Area<P>),
    Line(Line<P>),
    Point(Point<P>),
    Rectangle(Rectangle<P>),
}

/// An area to be drawn between two lines that share their X coordinates.
///
/// Area points move from left to right.
pub struct Area<P> {
    points: Vec<AreaPoint<P>>,
}

/// A single data point in an area shape.
pub struct AreaPoint<P> {
    /// X coordinate between 0.0 and 1.0.
    pub x: f32,

    /// Y coordinate between 0.0 and 1.0 for the bottom of the area.
    pub y_min: f32,

    /// Y coordinate between 0.0 and 1.0 for the top of the area.
    pub y_max: f32,

    /// The source this point was generated from.
    ///
    /// This would be a [Metric] if the chart was generated from [Timeseries].
    pub source: P,
}

/// A line to be drawn between two or more points.
pub struct Line<P> {
    points: Vec<Point<P>>,
}

/// A single point in the chart.
///
/// Points can be rendered independently as a dot, or can be used to draw lines
/// between them.
pub struct Point<P> {
    /// X coordinate between 0.0 and 1.0.
    x: f32,

    /// Y coordinate between 0.0 and 1.0.
    y: f32,

    /// The source this point was generated from.
    ///
    /// This would be a [Metric] if the chart was generated from [Timeseries].
    source: P,
}

/// A rectangle to be rendered inside the chart.
pub struct Rectangle<P> {
    pub x: f32,
    pub y: f32,
    pub width: f32,
    pub height: f32,

    /// The source this rectangle was generated from.
    ///
    /// This would be a [Metric] if the chart was generated from [Timeseries].
    pub source: P,
}

pub(crate) type StackedChartBuckets = Buckets<StackedChartBucketValue>;

#[derive(Clone, Copy, Default)]
pub(crate) struct StackedChartBucketValue {
    /// Used to keep track of how much a bucket is "filled" while calculating
    /// the area shapes.
    pub current_y: f32,

    /// The sum of all values in the bucket.
    pub total: f32,
}
