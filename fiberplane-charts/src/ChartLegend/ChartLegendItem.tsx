import styled, { css } from "styled-components";
import { useEffect } from "react";

import type { ChartLegendProps, Timeseries } from "./types";
import { Container, Icon } from "../BaseComponents";
import { FormattedTimeseries, isMac, noop, preventDefault } from "../utils";
import { useMeasure } from "../hooks";

type Props = {
  color: string;
  onHover: () => void;
  onToggleTimeseriesVisibility: ChartLegendProps["onToggleTimeseriesVisibility"];
  readOnly: boolean;
  index: number;
  setSize: (index: number, value: number) => void;
  timeseries: Timeseries;
  uniqueKeys: Array<string>;
};

export function ChartLegendItem({
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
        <Text>
          <FormattedTimeseries
            metric={timeseries}
            sortLabels
            emphasizedKeys={uniqueKeys}
          />
        </Text>
      </LegendItemContainer>
    </div>
  );
}

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
