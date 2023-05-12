import { memo, useContext, useEffect, useMemo, useRef } from "react";
import styled, { useTheme } from "styled-components";
import { VariableSizeList } from "react-window";

import type { ChartLegendProps } from "./types";
import { Container } from "../BaseComponents";
import { findUniqueKeys } from "../utils";
import { getChartColor } from "../colors";
import { ChartLegendItem } from "./ChartLegendItem";
import type { Timeseries } from "../providerTypes";
import { FocusedTimeseriesApiContext } from "../context";
import { useExpandable, useForceUpdate, useHandler } from "../hooks";

const DEFAULT_HEIGHT = 293;
const DEFAULT_SIZE = 50;
const EXPANDED_HEIGHT = 592;

export const Legend = memo(function Legend({
    onToggleTimeseriesVisibility,
    readOnly = false,
    timeseriesData,
    footerShown = true,
}: ChartLegendProps) {
    const { expandButton, gradient, isExpanded, onScroll, ref } =
        useExpandable<HTMLDivElement>({ defaultHeight: DEFAULT_HEIGHT });

    const { setFocusedTimeseries } = useContext(FocusedTimeseriesApiContext);

    const maxHeight = isExpanded ? EXPANDED_HEIGHT : DEFAULT_HEIGHT;

    const numSeries = timeseriesData.length;
    const resultsText = `${numSeries} result${numSeries === 1 ? "" : "s"}`;

    const uniqueKeys = useMemo(
        () => findUniqueKeys(timeseriesData),
        [timeseriesData]
    );
    const theme = useTheme();
    const listRef = useRef<VariableSizeList<Array<Timeseries>>>(null);
    const sizeMap = useRef(new Map<number, number>());
    const heightRef = useRef(timeseriesData.length * DEFAULT_SIZE);
    const update = useForceUpdate();

    useEffect(() => {
        sizeMap.current = new Map();
        heightRef.current = timeseriesData.length * DEFAULT_SIZE;
        update();
    }, [timeseriesData, update]);

    const getSize = (index: number) =>
        sizeMap.current.get(index) ?? DEFAULT_SIZE;

    const setSize = useHandler((index: number, size: number) => {
        const oldSize = getSize(index);
        sizeMap.current.set(index, size);
        listRef.current?.resetAfterIndex(index);
        heightRef.current += size - oldSize;

        if (heightRef.current < maxHeight) {
            update();
        }
    });

    const onMouseOut = () => setFocusedTimeseries(null);

    const render = useHandler(
        ({
            data,
            index,
            style,
        }: {
            data: Array<Timeseries>;
            index: number;
            style: React.CSSProperties;
        }) => {
            const timeseries = data[index];
            return (
                <div style={style}>
                    {timeseries && (
                        <ChartLegendItem
                            color={theme[getChartColor(index)]}
                            onHover={() => setFocusedTimeseries(timeseries)}
                            onToggleTimeseriesVisibility={
                                onToggleTimeseriesVisibility
                            }
                            readOnly={readOnly}
                            timeseries={timeseries}
                            uniqueKeys={uniqueKeys}
                            index={index}
                            setSize={setSize}
                        />
                    )}
                </div>
            );
        }
    );

    return (
        <ChartLegendContainer onMouseOut={onMouseOut} ref={ref}>
            <ExpandableContainer
                maxHeight={`${maxHeight}px`}
                onScroll={onScroll}
            >
                <VariableSizeList
                    height={Math.min(heightRef.current, maxHeight)}
                    width="100%"
                    ref={listRef}
                    itemCount={timeseriesData.length}
                    itemData={timeseriesData}
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
});

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
