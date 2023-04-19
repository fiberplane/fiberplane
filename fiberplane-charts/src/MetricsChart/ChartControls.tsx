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

type Props = {
  graphType: GraphType;
  onGraphTypeChange: (graphType: GraphType) => void;
  onStackingChange: (stackingType: StackingType) => void;
  showStackingControls: boolean;
  stackingType: StackingType;
};

/**
 * Control what kind fo chart you're viewing (and more)
 */
export function ChartControls({
  graphType,
  onGraphTypeChange,
  onStackingChange,
  showStackingControls,
  stackingType,
}: Props): JSX.Element {
  return (
    <ControlsContainer>
      <ControlsGroup key="core">
        <ControlsSet>
          <ControlsSetLabel>Type</ControlsSetLabel>
          <ButtonGroup>
            <IconButton
              active={graphType === "line"}
              aria-label="Line chart"
              className="iconButton"
              onClick={(event) => {
                preventDefault(event);
                onGraphTypeChange("line");
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
                onGraphTypeChange("bar");
              }}
            >
              <Icon type="chart_bar" />
            </IconButton>
          </ButtonGroup>
        </ControlsSet>

        {showStackingControls && (
          <ControlsSet>
            <ControlsSetLabel>Stacking</ControlsSetLabel>
            <ButtonGroup>
              <IconButton
                active={stackingType === "none"}
                aria-label="Combined/default"
                className="iconButton"
                onClick={(event) => {
                  preventDefault(event);
                  onStackingChange("none");
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
                  onStackingChange("stacked");
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
                  onStackingChange("percentage");
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
