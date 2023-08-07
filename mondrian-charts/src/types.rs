use serde::{Deserialize, Serialize};

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
#[derive(Default, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct MondrianChart<S, P> {
    pub x_axis: Axis,
    pub y_axis: Axis,
    pub shape_lists: Vec<ShapeList<S, P>>,
}

/// Defines the range of values that are displayed along a given axis.
#[derive(Default, Deserialize, Serialize)]
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

/// List of shapes that belongs together.
///
/// These should be rendered in the same color.
#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ShapeList<S, P> {
    pub shapes: Vec<Shape<P>>,

    /// The original source this shape list belongs to.
    ///
    /// This would be the type of input data the chart was generated from, such
    /// as [Timeseries].
    pub source: S,
}

#[derive(Deserialize, Serialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum Shape<P> {
    Area(Area<P>),
    Line(Line<P>),
    Point(Point<P>),
    Rectangle(Rectangle<P>),
}

/// An area to be drawn between two lines that share their X coordinates.
///
/// Area points move from left to right.
#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Area<P> {
    pub points: Vec<AreaPoint<P>>,
}

/// A single data point in an area shape.
#[derive(Deserialize, Serialize)]
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

/// A line to be drawn between two or more points.
#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Line<P> {
    pub points: Vec<Point<P>>,
}

/// A single point in the chart.
///
/// Points can be rendered independently as a dot, or can be used to draw lines
/// between them.
#[derive(Deserialize, Serialize)]
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

/// A rectangle to be rendered inside the chart.
#[derive(Deserialize, Serialize)]
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
