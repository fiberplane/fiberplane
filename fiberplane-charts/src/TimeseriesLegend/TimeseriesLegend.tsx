import styled from "styled-components";
import { useEffect, useMemo, useRef } from "react";
import { VariableSizeList } from "react-window";

import { TimeseriesLegendItem } from "./TimeseriesLegendItem";
import type { TimeseriesLegendProps } from "./types";
import { Container } from "../BaseComponents";
import { findUniqueKeys, noop } from "../utils";
import type { ShapeList } from "../Mondrian";
import type { Timeseries } from "../providerTypes";
import { useExpandable, useForceUpdate, useHandler } from "../hooks";

const DEFAULT_HEIGHT = 293;
const DEFAULT_SIZE = 50;
const EXPANDED_HEIGHT = 592;

export function TimeseriesLegend<S extends Timeseries, P>({
  footerShown = true,
  getShapeListColor,
  onFocusedShapeListChange,
  onToggleTimeseriesVisibility,
  readOnly = false,
  shapeLists,
}: TimeseriesLegendProps<S, P>) {
  const { expandButton, gradient, isExpanded, onScroll, ref } =
    useExpandable<HTMLDivElement>({ defaultHeight: DEFAULT_HEIGHT });

  const maxHeight = isExpanded ? EXPANDED_HEIGHT : DEFAULT_HEIGHT;

  const timeseriesData = useMemo(
    () => shapeLists.map((shapeList) => shapeList.source),
    [shapeLists],
  );
  const numSeries = timeseriesData.length;
  const resultsText = `${numSeries} result${numSeries === 1 ? "" : "s"}`;

  const uniqueKeys = useMemo(
    () => findUniqueKeys(timeseriesData),
    [timeseriesData],
  );
  const listRef = useRef<VariableSizeList<Array<ShapeList<S, P>>>>(null);
  const sizeMap = useRef(new Map<number, number>());
  const heightRef = useRef(timeseriesData.length * DEFAULT_SIZE);
  const update = useForceUpdate();

  useEffect(() => {
    sizeMap.current = new Map();
    heightRef.current = timeseriesData.length * DEFAULT_SIZE;
    update();
  }, [timeseriesData, update]);

  const getSize = (index: number) => sizeMap.current.get(index) ?? DEFAULT_SIZE;

  const setSize = useHandler((index: number, size: number) => {
    const oldSize = getSize(index);
    sizeMap.current.set(index, size);
    listRef.current?.resetAfterIndex(index);
    heightRef.current += size - oldSize;

    if (heightRef.current < maxHeight) {
      update();
    }
  });

  const onMouseOut = () => onFocusedShapeListChange?.(null);

  const setFocusedTimeseries = onFocusedShapeListChange
    ? (timeseries: Timeseries) => {
        const shapeList = shapeLists.find(
          (shapeList) => shapeList.source === timeseries,
        );
        if (shapeList) {
          onFocusedShapeListChange(shapeList);
        }
      }
    : noop;

  type RenderProps = {
    data: Array<ShapeList<S, P>>;
    index: number;
    style: React.CSSProperties;
  };

  const render = useHandler(({ data, index, style }: RenderProps) => {
    const shapeList = data[index];
    const timeseries = shapeList.source;
    return (
      <div style={style}>
        {timeseries && (
          <TimeseriesLegendItem
            color={getShapeListColor(shapeList)}
            onHover={() => setFocusedTimeseries(timeseries)}
            onToggleTimeseriesVisibility={onToggleTimeseriesVisibility}
            readOnly={readOnly}
            timeseries={timeseries}
            uniqueKeys={uniqueKeys}
            index={index}
            setSize={setSize}
          />
        )}
      </div>
    );
  });

  return (
    <ChartLegendContainer onMouseOut={onMouseOut} ref={ref}>
      <ExpandableContainer maxHeight={`${maxHeight}px`} onScroll={onScroll}>
        <VariableSizeList
          height={Math.min(heightRef.current, maxHeight)}
          width="100%"
          ref={listRef}
          itemCount={shapeLists.length}
          itemData={shapeLists}
          itemSize={getSize}
        >
          {render}
        </VariableSizeList>
        {gradient}
      </ExpandableContainer>
      {footerShown && (
        <Footer>
          <Results>{resultsText}</Results>
          {expandButton}
        </Footer>
      )}
    </ChartLegendContainer>
  );
}

const ExpandableContainer = styled.div<{
  maxHeight: Exclude<React.CSSProperties["height"], undefined>;
}>`
    max-height: ${({ maxHeight }) => maxHeight};
    overflow: auto;
`;

const Footer = styled.div`
    width: 100%;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const ChartLegendContainer = styled(Container)`
    flex-direction: column;
    font: ${({ theme }) => theme.fontLegendShortHand};
    letter-spacing: ${({ theme }) => theme.fontLegendLetterSpacing};
    letter-spacing: 0.02em;
    padding: 10px 0 0;
    position: relative;
    word-wrap: break-word;
`;

const Results = styled.span`
    font: ${({ theme }) => theme.fontResultsSummaryShortHand};
    letter-spacing: ${({ theme }) => theme.fontResultsSummaryLetterSpacing};
    color: ${({ theme }) => theme.colorBase400};
`;
