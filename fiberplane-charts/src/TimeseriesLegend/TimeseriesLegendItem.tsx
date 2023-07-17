import { Fragment, memo, useEffect } from "react";
import styled, { css } from "styled-components";

import { Container, Icon } from "../BaseComponents";
import { isMac, noop, preventDefault, sortBy } from "../utils";
import type { Timeseries } from "../providerTypes";
import type { ToggleTimeseriesEvent } from "./types";
import { useMeasure } from "../hooks";

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

  return (
    <div ref={ref} onClick={toggleTimeseriesVisibility} onKeyDown={onKeyDown}>
      <LegendItemContainer
        onMouseOver={timeseries.visible ? onHover : noop}
        interactive={!readOnly && onToggleTimeseriesVisibility !== undefined}
      >
        <ColorBlock color={color} selected={timeseries.visible}>
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
                <Emphasis key={key}>{value}</Emphasis>
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

const ColorBlock = styled.div<{ color: string; selected: boolean }>`
    background: ${({ color, selected }) => (selected ? color : "transparent")};
    border: 2px solid ${({ color }) => color};
    width: 14px;
    height: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${({ theme }) => theme.colorBackground};
    border-radius: ${({ theme }) => theme.borderRadius400};
`;

const Emphasis = styled.span`
  background-color: ${({ theme }) => theme.colorBase200};
  /* TODO (Jacco): we should try and find out what to do with this styling */
  /* stylelint-disable-next-line scale-unlimited/declaration-strict-value */
  font-weight: 600;
  border-radius: ${({ theme }) => theme.borderRadius500};
  padding: 1px 4px;
  display: inline-block;
`;

const InteractiveItemStyling = css`
    cursor: pointer;

    &:hover {
        background: ${({ theme }) => theme.colorPrimaryAlpha100};
    }
`;

const LegendItemContainer = styled(Container)<{ interactive: boolean }>`
    border-radius: ${({ theme }) => theme.borderRadius500};
    display: flex;
    align-items: center;
    font: ${({ theme }) => theme.fontAxisShortHand};
    padding: 8px 8px 8px 14px;
    gap: 10px;
    word-wrap: anywhere;

    ${({ interactive }) => interactive && InteractiveItemStyling}
`;

const Text = styled.div`
    flex: 1;
`;
