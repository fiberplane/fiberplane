import {
  ButtonGroup,
  ControlsContainer,
  ControlsGroup,
  ControlsSet,
  ControlsSetLabel,
  Icon,
  IconButton,
} from "../BaseComponents";
import type { GraphType, StackingType } from "../providerTypes";
import { preventDefault } from "../utils";

export type ChartControlsProps = {
  graphType: GraphType;
  onChangeGraphType?: (graphType: GraphType) => void;
  onChangeStackingType?: (stackingType: StackingType) => void;
  stackingControlsShown: boolean;
  stackingType: StackingType;
};

/**
 * Control what kind fo chart you're viewing (and more)
 */
export function ChartControls({
  graphType,
  onChangeGraphType,
  onChangeStackingType,
  stackingControlsShown,
  stackingType,
}: ChartControlsProps): JSX.Element | null {
  if (!onChangeGraphType && !onChangeStackingType) {
    return null;
  }

  return (
    <ControlsContainer>
      <ControlsGroup key="core">
        {onChangeGraphType && (
          <ControlsSet>
            <ControlsSetLabel>Type</ControlsSetLabel>
            <ButtonGroup>
              <IconButton
                active={graphType === "line"}
                aria-label="Line chart"
                className="iconButton"
                onClick={(event) => {
                  preventDefault(event);
                  onChangeGraphType("line");
                }}
              >
                <Icon type="chart_line" />
              </IconButton>

              <IconButton
                active={graphType === "bar"}
                aria-label="Bar chart"
                className="iconButton"
                onClick={(event) => {
                  preventDefault(event);
                  onChangeGraphType("bar");
                }}
              >
                <Icon type="chart_bar" />
              </IconButton>
            </ButtonGroup>
          </ControlsSet>
        )}

        {stackingControlsShown && onChangeStackingType && (
          <ControlsSet>
            <ControlsSetLabel>Stacking</ControlsSetLabel>
            <ButtonGroup>
              <IconButton
                active={stackingType === "none"}
                aria-label="Combined/default"
                className="iconButton"
                onClick={(event) => {
                  preventDefault(event);
                  onChangeStackingType("none");
                }}
              >
                <Icon type="combined" />
              </IconButton>

              <IconButton
                active={stackingType === "stacked"}
                aria-label="Stacked"
                className="iconButton"
                type="button"
                onClick={(event) => {
                  preventDefault(event);
                  onChangeStackingType("stacked");
                }}
              >
                <Icon type="stacked" />
              </IconButton>

              <IconButton
                active={stackingType === "percentage"}
                aria-label="Stacked/percentage"
                className="iconButton"
                onClick={(event) => {
                  preventDefault(event);
                  onChangeStackingType("percentage");
                }}
              >
                <Icon type="percentage" />
              </IconButton>
            </ButtonGroup>
          </ControlsSet>
        )}
      </ControlsGroup>
      <ControlsGroup key="meta" />
    </ControlsContainer>
  );
}
