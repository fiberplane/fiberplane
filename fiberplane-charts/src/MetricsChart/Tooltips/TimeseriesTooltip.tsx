import type { Metric, Timeseries } from "../../providerTypes";
import { TooltipBody } from "./TooltipBody";
import { TooltipCaption } from "./TooltipCaption";

type Props = {
  metric: Metric;
  timeseries: Timeseries;
};

export function TimeseriesTooltip({ timeseries, metric }: Props): JSX.Element {
  return (
    <table>
      <TooltipCaption>{metric.time}</TooltipCaption>
      <thead>
        <tr>
          <th>{timeseries.name || "value"}</th>
          <th>{metric.value}</th>
        </tr>
      </thead>
      <TooltipBody labels={timeseries.labels} />
    </table>
  );
}
