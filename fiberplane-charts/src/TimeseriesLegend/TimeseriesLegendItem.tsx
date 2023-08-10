import { Fragment, memo, useContext, useEffect } from "react";
import styled, { css } from "styled-components";

import { Container, Icon } from "../BaseComponents";
import { isMac, noop, preventDefault, sortBy } from "../utils";
import type { Timeseries } from "../providerTypes";
import type { ToggleTimeseriesEvent } from "./types";
import { useMeasure } from "../hooks";
import { ThemeContext } from "../theme";
import { ChartTheme } from "..";

type Props = {
  color: string;
  index: number;
  onHover: () => void;
  onToggleTimeseriesVisibility?: (event: ToggleTimeseriesEvent) => void;
  readOnly: boolean;
  setSize: (index: number, value: number) => void;
  timeseries: Timeseries;
  uniqueKeys: Array<string>;
};

export function TimeseriesLegendItem({
  color,
  onHover,
  onToggleTimeseriesVisibility,
  readOnly,
  index,
  setSize,
  timeseries,
  uniqueKeys,
}: Props): JSX.Element {
  const [ref, { height }] = useMeasure<HTMLDivElement>();

  useEffect(() => {
    if (height) {
      setSize(index, height);
    }
  }, [height, setSize, index]);

  const toggleTimeseriesVisibility =
    onToggleTimeseriesVisibility && !readOnly
      ? (event: React.MouseEvent | React.KeyboardEvent) => {
          preventDefault(event);
          const toggleSingle = isMac ? event.metaKey : event.ctrlKey;
          onToggleTimeseriesVisibility({
            timeseries,
            toggleOthers: !toggleSingle,
          });
        }
      : noop;

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Space") {
      toggleTimeseriesVisibility(event);
    }
  };

  const chartTheme = useContext(ThemeContext);

  return (
    <div ref={ref} onClick={toggleTimeseriesVisibility} onKeyDown={onKeyDown}>
      <LegendItemContainer
        $chartTheme={chartTheme}
        onMouseOver={timeseries.visible ? onHover : noop}
        interactive={!readOnly && onToggleTimeseriesVisibility !== undefined}
      >
        <ColorBlock
          $chartTheme={chartTheme}
          color={color}
          selected={timeseries.visible}
        >
          {timeseries.visible && <Icon type="check" width="12" height="12" />}
        </ColorBlock>
        <FormattedTimeseries metric={timeseries} emphasizedKeys={uniqueKeys} />
      </LegendItemContainer>
    </div>
  );
}

const FormattedTimeseries = memo(function FormattedTimeseries({
  metric,
  emphasizedKeys = [],
}: {
  metric: Timeseries;
  emphasizedKeys?: Array<string>;
}): JSX.Element {
  const { name, labels } = metric;

  const labelEntries = sortBy(Object.entries(labels), ([key]) => key);

  const chartTheme = useContext(ThemeContext);

  return (
    <Text>
      {name && `${name}: `}
      {labelEntries.map(([key, value], index) => (
        <Fragment key={key}>
          {index > 0 && ", "}
          <span className={key in emphasizedKeys ? "emphasize" : ""}>
            {key}
            {value && [
              ": ",
              emphasizedKeys.includes(key) ? (
                <Emphasis $chartTheme={chartTheme} key={key}>
                  {value}
                </Emphasis>
              ) : (
                value
              ),
            ]}
          </span>
        </Fragment>
      ))}
    </Text>
  );
});

const ColorBlock = styled.div<{
  $chartTheme: ChartTheme;
  color: string;
  selected: boolean;
}>`
  background: ${({ color, selected }) => (selected ? color : "transparent")};
  border: 2px solid ${({ color }) => color};
  width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ $chartTheme }) => $chartTheme.colorBackground};
  border-radius: ${({ $chartTheme }) => $chartTheme.borderRadius400};
`;

const Emphasis = styled.span<{ $chartTheme: ChartTheme }>`
  /* FIXME: These vars are to support style overrides for dark mode */
  background-color: var(
      --fp-chart-legend-emphasis-bg,
      ${({ $chartTheme }) => $chartTheme.colorBase200}
  );
  color: var(--fp-chart-legend-emphasis-color, currentColor);
  /* TODO (Jacco): we should try and find out what to do with this styling */
  /* stylelint-disable-next-line scale-unlimited/declaration-strict-value */
  font-weight: 600;
  border-radius: ${({ $chartTheme }) => $chartTheme.borderRadius500};
  padding: 1px 4px;
  display: inline-block;
`;

const LegendItemContainer = styled(Container)<{
  $chartTheme: ChartTheme;
  interactive: boolean;
}>(
  ({ $chartTheme, interactive }) => css`
    border-radius: ${$chartTheme.borderRadius500};
    display: flex;
    align-items: center;
    font: ${$chartTheme.fontAxisShortHand};
    padding: 8px 8px 8px 14px;
    gap: 10px;
    word-wrap: anywhere;

    ${
      interactive &&
      css`
        cursor: pointer;

        &:hover {
          /* FIXME: These vars are to support style overrides for dark mode */
          background: var(
              --fp-chart-legend-hover-bg,
              ${$chartTheme.colorPrimaryAlpha100}
          );
          color: var(--fp-chart-legend-hover-color, currentColor);
        }
      `
    }
  `,
);

const Text = styled.div`
    flex: 1;
`;
