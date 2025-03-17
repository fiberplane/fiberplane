/**
 * Returns a tailwind color
 */
function getStateBackgroundColor(readyState: WebSocket["readyState"]) {
  switch (readyState) {
    case WebSocket.CONNECTING:
      return "bg-yellow-500/50";
    case WebSocket.OPEN:
      return "bg-green-500/50";
    case WebSocket.CLOSING:
      return "bg-red-500/50";
    case WebSocket.CLOSED:
      return "bg-gray-500/50";
    default:
      return "bg-gray-500/50";
  }
}

function getStateBorderColor(readyState: WebSocket["readyState"]) {
  switch (readyState) {
    case WebSocket.CONNECTING:
      return "border-yellow-500";
    case WebSocket.OPEN:
      return "border-green-500";
    case WebSocket.CLOSING:
      return "border-red-500";
    case WebSocket.CLOSED:
      return "border-gray-500";
    default:
      return "border-gray-500";
  }
}

function getStateText(readyState: WebSocket["readyState"]) {
  switch (readyState) {
    case WebSocket.CONNECTING:
      return "Connecting...";
    case WebSocket.OPEN:
      return "Connected!";
    case WebSocket.CLOSING:
      return "Closing...";
    case WebSocket.CLOSED:
      return "Closed!";
    default:
      return "Unknown";
  }
}

export function ConnectionStatus({
  readyState,
}: Pick<WebSocket, "readyState">) {
  const bgColor = getStateBackgroundColor(readyState);
  const borderColor = getStateBorderColor(readyState);
  const stateText = getStateText(readyState);

  return (
    <span
      className={`block rounded-full overflow-hidden w-3 h-3 text-white ${bgColor} border ${borderColor}`}
      title={stateText}
    />
  );
}
