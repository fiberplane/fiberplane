import { useContext, useMemo, useRef } from "react";
import { VariableSizeList } from "react-window";
import styled, { css } from "styled-components";

import { Container } from "../BaseComponents";
import type { ShapeList } from "../Mondrian";
import { useExpandable, useForceUpdate, useHandler } from "../hooks";
import type { Timeseries } from "../providerTypes";
import { ChartThemeContext } from "../theme";
import { findUniqueKeys, noop } from "../utils";
import { TimeseriesLegendItem } from "./TimeseriesLegendItem";
import type { TimeseriesLegendProps } from "./types";

const DEFAULT_HEIGHT = 293;
const DEFAULT_SIZE = 30;
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

  const getSize = (index: number) => sizeMap.current.get(index) ?? DEFAULT_SIZE;

  const setSize = useHandler((index: number, size: number) => {
    const oldSize = getSize(index);
    if (oldSize === size) {
      return;
    }

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
      timeseries && (
        <TimeseriesLegendItem
          color={getShapeListColor(shapeList.source, index)}
          onHover={() => setFocusedTimeseries(timeseries)}
          onToggleTimeseriesVisibility={onToggleTimeseriesVisibility}
          readOnly={readOnly}
          timeseries={timeseries}
          uniqueKeys={uniqueKeys}
          index={index}
          setSize={setSize}
          style={style}
        />
      )
    );
  });

  return (
    <ChartLegendContainer onMouseOut={onMouseOut}>
      <VariableSizeList
        estimatedItemSize={DEFAULT_HEIGHT}
        height={Math.min(heightRef.current, maxHeight)}
        onScroll={onScroll}
        outerRef={ref}
        width="100%"
        ref={listRef}
        itemCount={shapeLists.length}
        itemData={shapeLists}
        itemSize={getSize}
      >
        {render}
      </VariableSizeList>
      {gradient}
      {footerShown && (
        <Footer>
          <Results>{resultsText}</Results>
          {expandButton}
        </Footer>
      )}
    </ChartLegendContainer>
  );
}

const Footer = styled.div`
  width: 100%;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ChartLegendContainer = styled(Container)`
  flex-direction: column;
  padding: 10px 0 0;
  position: relative;
  word-wrap: break-word;
`;

const Results = styled.span(() => {
  const theme = useContext(ChartThemeContext);

  return css`
    font: ${theme.legendResultsFont};
    letter-spacing: ${theme.legendResultsLetterSpacing};
    color: ${theme.legendResultsColor};
  `;
});
