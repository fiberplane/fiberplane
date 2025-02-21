type ExecutionStatus = "pending" | "success" | "error";

export function StatusBadge({
  status,
  title,
}: {
  status: ExecutionStatus;
  title?: string;
}) {
  const statusConfig = {
    pending: { color: "bg-blue-100 text-blue-800", label: "Running" },
    success: { color: "bg-green-100 text-green-800", label: "Success" },
    error: { color: "bg-red-100 text-red-800", label: "Failed" },
  }[status];

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}
      title={title}
    >
      {statusConfig.label}
    </span>
  );
}
