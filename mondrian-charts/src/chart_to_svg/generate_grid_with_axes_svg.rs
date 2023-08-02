use super::{ChartOptions, Scales};
use crate::AbstractChart;

pub(super) fn generate_grid_with_axes_svg<S, P>(
    chart: &AbstractChart<S, P>,
    scales: &Scales,
    options: &ChartOptions,
) -> String {
    String::new() // TODO
}
