import { useMemo } from "react";

// Define proper TypeScript props interface
type RequestTimingProps = {
  timings?: {
    total: number;
    latency: number;
  };
  maxTotal?: number; // Optional max value for scaling
};

export const RequestTimingVisualizer: React.FC<RequestTimingProps> = ({
  timings = { total: 0, latency: 0 },
  maxTotal,
}) => {
  // Calculate the remaining time (total - latency)
  const processingTime = useMemo(
    () => timings.total - timings.latency,
    [timings],
  );

  // Calculate percentage for visualization (relative to either total or maxTotal)
  const scale = useMemo(
    () => (maxTotal ? maxTotal : timings.total || 1), // Prevent division by zero
    [timings.total, maxTotal],
  );

  const latencyWidth = useMemo(
    () => ((timings.latency || 0) / scale) * 100,
    [timings.latency, scale],
  );

  const processingWidth = useMemo(
    () => (processingTime / scale) * 100,
    [processingTime, scale],
  );

  const showLatency = latencyWidth > 0.1;

  return (
    <div className="w-full grid items-center space-x-2 text-xs">
      <div className="flex-1 h-3 flex rounded-sm overflow-hidden bg-muted">
        {/* Latency segment - only show if large enough */}
        {showLatency && (
          <div
            className="h-full bg-blue-500"
            style={{ width: `${latencyWidth}%` }}
            title={`Latency: ${formatTime(timings.latency)}`}
          />
        )}

        {/* Processing segment */}
        <div
          className="h-full bg-green-500"
          style={{ width: `${processingWidth}%` }}
          title={`Processing: ${formatTime(processingTime)}`}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="w-16 text-muted-foreground">
          <div>Latency</div>
          <div>{formatTime(timings.latency)}</div>
        </div>

        <div className="w-16 text-left text-muted-foreground">
          <div>Total</div>
          <div>{formatTime(timings.total)}</div>
        </div>
      </div>
    </div>
  );
};

export default RequestTimingVisualizer;

function formatTime(ms: number): string {
  if (ms < 1) {
    return `${(ms * 1000).toFixed(0)}μs`;
  }

  if (ms < 1000) {
    return `${ms.toFixed(1)}ms`;
  }

  return `${(ms / 1000).toFixed(2)}s`;
}
