import { cn } from "@/utils";
import { CopyAsCurl } from "./CopyAsCurl";
import { RequestBodyTypeDropdown } from "./RequestBodyCombobox";

export function BottomToolbar() {
  return (
    <div
      className={cn(
        "bg-muted",
        "flex justify-between absolute bottom-0 w-full border-t",
      )}
    >
      <RequestBodyTypeDropdown />

      <CopyAsCurl />
    </div>
  );
}
