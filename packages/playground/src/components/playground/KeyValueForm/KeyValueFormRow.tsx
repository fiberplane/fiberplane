import {
  CodeMirrorInput,
  type CodeMirrorInputType,
} from "@/components/CodeMirrorEditor/CodeMirrorInput";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn, noop } from "@/utils";
import { TrashIcon } from "@radix-ui/react-icons";
import type { KeyValueElement } from "../store";
import { KeyValueFormRowValue } from "./KeyValueFormRowValue";

type KeyValueRowProps = {
  isDraft: boolean;
  keyValueData: KeyValueElement;
  onChangeEnabled: (enabled: boolean) => void;
  onChangeKey?: (key: string) => void;
  removeValue?: () => void;
  onSubmit?: () => void;
  handleCmdG?: () => void;
  handleCmdB?: () => void;
  keyPlaceholder?: string;
  keyInputType?: CodeMirrorInputType;
  valueInputType?: CodeMirrorInputType;
} & (
  | {
      onChangeValue: (value: string | File) => void;
      showFileSelector: true;
    }
  | {
      onChangeValue: (value: string) => void;
      showFileSelector?: false;
    }
);

export const KeyValueFormRow = (props: KeyValueRowProps) => {
  const {
    isDraft,
    onChangeEnabled,
    onChangeKey,
    removeValue,
    keyValueData,
    onSubmit,
    handleCmdG,
    handleCmdB,
    keyPlaceholder = "name",
    keyInputType,
  } = props;
  const { enabled, key } = keyValueData;

  return (
    <div className={cn("flex items-center gap-1 rounded p-0", "group")}>
      <Checkbox
        checked={enabled}
        disabled={isDraft}
        onCheckedChange={() => {
          const handler = isDraft ? noop : () => onChangeEnabled(!enabled);
          return handler();
        }}
      />
      <CodeMirrorInput
        className="w-[140px]"
        value={key}
        placeholder={keyPlaceholder}
        readOnly={!onChangeKey}
        onChange={(value) => onChangeKey?.(value ?? "")}
        onSubmit={onSubmit}
        inputType={keyInputType}
        handleCmdG={handleCmdG}
        handleCmdB={handleCmdB}
      />
      <KeyValueFormRowValue {...props} />
      <div
        className={cn("flex invisible items-center", {
          "group-focus-within:visible group-hover:visible":
            !isDraft && !!removeValue,
        })}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-3.5 w-3.5 p-0.5 cursor-pointer enabled:hover:bg-transparent transition-color
          text-muted-foreground"
          disabled={isDraft}
          onClick={() => !isDraft && removeValue?.()}
        >
          <TrashIcon
            className={cn("w-4 h-4", {})}
            onClick={() => !isDraft && removeValue?.()}
          />
        </Button>
      </div>
    </div>
  );
};
