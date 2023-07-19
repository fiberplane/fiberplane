import type { ProviderEvent } from "../../providerTypes";
import { TooltipBody } from "./TooltipBody";
import { TooltipCaption } from "./TooltipCaption";

type Props = {
  event: ProviderEvent;
};

export function EventTooltip({ event }: Props): JSX.Element {
  return (
    <table>
      <TooltipCaption>
        {event.title} @ {event.time}
      </TooltipCaption>
      <TooltipBody labels={event.labels} />
    </table>
  );
}
