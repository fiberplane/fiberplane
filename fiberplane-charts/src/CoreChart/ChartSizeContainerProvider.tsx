import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { debounce } from "throttle-debounce";

import { useMeasure } from "../hooks";
import {
  ChartSizeContext,
  type ChartSizeContextValue,
} from "./ChartSizeContext";
import { mergeRefs } from "../utils";

type Props = {
  children: React.ReactNode;
  className?: string;
  // By default the measured height will be used unless this value is specified
  // This is useful for charts that contain more than just the chart (but also a legend, for example)
  overrideHeight?: number;
  marginTop?: number;
  marginLeft?: number;
  marginRight?: number;
  marginBottom?: number;
};

export function ChartSizeContainerProvider({
  children,
  className,
  overrideHeight,
  marginTop = 0,
  marginRight = 0,
  marginBottom = 0,
  marginLeft = 0,
}: Props) {
  const [measureRef, { width, height: measuredHeight }] =
    useMeasure<HTMLDivElement>();
  const initialMeasureRef = useRef<HTMLDivElement>(null);
  const ref = mergeRefs([measureRef, initialMeasureRef]);

  const [value, setValue] = useState<ChartSizeContextValue>({
    xMax: 0,
    yMax: 0,
    width: 0,
    height: 0,
    marginTop,
    marginRight,
    marginBottom,
    marginLeft,
  });

  const height = overrideHeight ?? measuredHeight;
  const rawUpdateValue = useCallback(
    (width: number, height: number) => {
      setValue((prev) => {
        if (
          width === prev.width &&
          height === prev.height &&
          prev.marginTop === marginTop &&
          prev.marginRight === marginRight &&
          prev.marginBottom === marginBottom &&
          prev.marginLeft === marginLeft
        ) {
          return prev;
        }
        return {
          xMax: width - marginLeft - marginRight,
          yMax: height - marginTop - marginBottom,
          width,
          height,
          marginTop,
          marginRight,
          marginBottom,
          marginLeft,
        };
      });
    },
    [marginTop, marginRight, marginBottom, marginLeft],
  );

  useLayoutEffect(() => {
    if (initialMeasureRef.current) {
      const size = initialMeasureRef.current.getBoundingClientRect();
      rawUpdateValue(size.width, size.height);
    }
  }, []);

  const updateValue = useMemo(
    () => debounce(100, rawUpdateValue),
    [rawUpdateValue],
  );

  useEffect(() => {
    updateValue(width, height);
  }, [width, height, updateValue]);

  return (
    <div ref={ref} className={className}>
      {value.width > 0 && value.height > 0 ? (
        <ChartSizeContext.Provider value={value}>
          {children}
        </ChartSizeContext.Provider>
      ) : (
        <ChartSkeleton height={height} />
      )}
    </div>
  );
}

function ChartSkeleton({ height }: { height: number }) {
  return <div style={{ height }} />;
}
