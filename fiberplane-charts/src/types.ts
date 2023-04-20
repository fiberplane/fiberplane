import type { Timestamp } from "./providerTypes";

export type {
    GraphType,
    Metric,
    OtelMetadata,
    StackingType,
    Timeseries,
    Timestamp,
} from "./providerTypes";

/**
 * Function to invoke to close the tooltip.
 */
export type CloseTooltipFn = () => void;

/**
 * Function to display a tooltip relative to the given anchor containing the
 * given React content.
 *
 * Should return a function to close the tooltip.
 */
export type ShowTooltipFn = (
    anchor: TooltipAnchor,
    content: React.ReactNode,
) => CloseTooltipFn;

export type TimeRange = {
    from: Timestamp;
    to: Timestamp;
};

/**
 * Anchor to determine where the tooltip should be positioned.
 *
 * Positioning relative to the anchor is left to the callback provided.
 */
export type TooltipAnchor = HTMLElement | VirtualElement;

export type VirtualElement = {
    getBoundingClientRect: () => DOMRect;
    contextElement: Element;
};
