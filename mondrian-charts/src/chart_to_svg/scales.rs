/// Scales to use for rendering SVG components.
///
/// Fortunately for us, our abstract charts are normalized along both axes to
/// values from 0.0 to 1.0, meaning we can suffice with trivial linear scales.
pub(super) struct Scales {
    pub x_max: f64,
    pub y_max: f64,
}

impl Scales {
    pub fn new(x_max: f64, y_max: f64) -> Self {
        Self { x_max, y_max }
    }

    /// Scales an abstract chart coordinate to a pixel coordinate
    /// along the X axis.
    pub fn x(&self, coordinate: f64) -> f64 {
        coordinate * self.x_max
    }

    /// Scales an abstract chart coordinate to a pixel coordinate
    /// along the Y axis.
    pub fn y(&self, coordinate: f64) -> f64 {
        self.y_max - coordinate * self.y_max
    }
}
