import { Fragment, memo, useContext, useLayoutEffect, useRef } from "react";
import { css, styled } from "styled-components";

import { Container, Icon } from "../BaseComponents";
import type { WithChartTheme } from "../chartThemeTypes";
import { useMeasure } from "../hooks";
import type { Timeseries } from "../providerTypes";
import { ChartThemeContext } from "../theme";
import { isMac, noop, preventDefault, sortBy } from "../utils";
import type { ToggleTimeseriesEvent } from "./types";

type Props = {
  color: string;
  index: number;
  onHover: () => void;
  onToggleTimeseriesVisibility?: (event: ToggleTimeseriesEvent) => void;
  readOnly: boolean;
  setSize: (index: number, value: number) => void;
  style: React.CSSProperties;
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
  style,
  timeseries,
  uniqueKeys,
}: Props): JSX.Element {
  const [ref, { height }] = useMeasure<HTMLDivElement>();
  const heightRef = useRef<number | null>(null);

  useLayoutEffect(() => {
    const delta =
      height && heightRef.current
        ? Math.max(height, heightRef.current) -
          Math.min(height, heightRef.current)
        : undefined;
    if (delta === undefined || delta > 1) {
      heightRef.current = height;
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

  const chartTheme = useContext(ChartThemeContext);
  return (
    <div
      style={style}
      onClick={toggleTimeseriesVisibility}
      onKeyDown={onKeyDown}
    >
      <ResizeContainer ref={ref}>
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
          <FormattedTimeseries
            metric={timeseries}
            emphasizedKeys={uniqueKeys}
          />
        </LegendItemContainer>
      </ResizeContainer>
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

  const chartTheme = useContext(ChartThemeContext);

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

const ColorBlock = styled.div<
  WithChartTheme & { color: string; selected: boolean }
>(
  ({ $chartTheme, color, selected }) => css`
    grid-area: checkbox;
    background: ${selected ? color : "transparent"};
    border: 2px solid ${color};
    width: 14px;
    height: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${$chartTheme.legendItemCheckboxColor};
    border-radius: ${$chartTheme.legendItemCheckboxBorderRadius};
  `,
);

const Emphasis = styled.span<WithChartTheme>(
  ({ $chartTheme }) => css`
    background-color: ${$chartTheme.legendItemEmphasisBackgroundColor};
    color: ${$chartTheme.legendItemEmphasisColor};
    font: ${$chartTheme.legendItemEmphasisFont};
    border-radius: ${$chartTheme.legendItemEmphasisBorderRadius};
    padding: 1px 4px;
    display: inline-block;
  `,
);

const ResizeContainer = styled.div`
  min-height: fit-content;
`;

const LegendItemContainer = styled(Container)<
  WithChartTheme & { interactive: boolean }
>(
  ({ $chartTheme, interactive }) => css`
    display: grid;
    grid-template: "checkbox text" auto / 20px auto;
    border-radius: ${$chartTheme.legendItemBorderRadius};
    align-items: center;
    font: ${$chartTheme.legendItemFont};
    color: ${$chartTheme.legendItemColor};
    padding: 8px 8px 8px 14px;
    gap: 10px;
    word-wrap: anywhere;

    ${
      interactive &&
      css`
        cursor: pointer;

        &:hover {
            background: ${$chartTheme.legendItemOnHoverBackgroundColor};
            color: ${$chartTheme.legendItemOnHoverColor};
        }
      `
    }
  `,
);

const Text = styled.div`
  grid-area: text;
`;
