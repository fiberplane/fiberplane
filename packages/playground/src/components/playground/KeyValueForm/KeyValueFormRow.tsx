import {
  CodeMirrorInput,
  type CodeMirrorInputType,
} from "@/components/CodeMirrorEditor/CodeMirrorInput";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { FpLabel } from "@/components/ui/label";
import { FpRadioGroup, FpRadioGroupItem } from "@/components/ui/radio-group";
import { isSupportedSchemaObject } from "@/lib/isOpenApi";
import { cn, noop } from "@/utils";
import { TrashIcon } from "@radix-ui/react-icons";
import { FileIcon } from "lucide-react";
import type { KeyValueElement } from "../store";

type KeyValueRowProps = {
  isDraft: boolean;
  keyValueData: KeyValueElement;
  onChangeEnabled: (enabled: boolean) => void;
  onChangeKey?: (key: string) => void;
  onChangeValue: (value: string) => void;
  removeValue?: () => void;
  onSubmit?: () => void;
  handleCmdG?: () => void;
  handleCmdB?: () => void;
  keyPlaceholder?: string;
  keyInputType?: CodeMirrorInputType;
  valueInputType?: CodeMirrorInputType;
};

export const KeyValueFormRow = (props: KeyValueRowProps) => {
  const {
    isDraft,
    onChangeEnabled,
    onChangeKey,
    onChangeValue,
    removeValue,
    keyValueData,
    onSubmit,
    handleCmdG,
    handleCmdB,
    keyPlaceholder = "name",
    keyInputType,
    valueInputType,
  } = props;
  const { enabled, key, data, parameter } = keyValueData;

  const schema =
    parameter.schema && isSupportedSchemaObject(parameter.schema)
      ? parameter.schema
      : undefined;

  if (key === "page") {
    console.log("data", data);
  }
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
      {data.type === "file" ? (
        <div className="h-8 flex-grow bg-transparent shadow-none px-2 py-0 text-sm border-none">
          <Button variant="secondary" className="h-8">
            <FileIcon className="w-3 h-3 mr-2" />
            {data.value?.name ?? <em>No file selected</em>}
          </Button>
        </div>
      ) : schema?.enum ? (
        <FpRadioGroup
          defaultValue={data.value}
          onValueChange={(value) => onChangeValue(value)}
          className="flex flex-wrap gap-2 w-[calc(100%-140px)]"
        >
          {schema.enum.map((enumValue) => (
            <FpLabel
              key={enumValue}
              className={cn(
                "grid grid-cols-[auto_1fr] gap-2 items-center overflow-hidden",
                "cursor-pointer text-muted-foreground hover:text-foreground first:ml-2",
              )}
            >
              <FpRadioGroupItem id={enumValue} value={enumValue} />
              {enumValue}
            </FpLabel>
          ))}
        </FpRadioGroup>
      ) : schema && (schema.type === "number" || schema.type === "integer") ? (
        <div className="w-[calc(100%-140px)]">
          <Input
            value={data.value}
            type="number"
            placeholder="value"
            step={schema.type === "integer" ? 1 : undefined}
            min={schema.minimum}
            max={schema.maximum}
            className="p-0 pl-1.5 border-transparent [&:not(:focus)]:no-spinner focus-visible:ring-primary shadow-none h-7 invalid:[&:not(:focus)]:border-danger invalid:[&:not(:focus)]:animate-shake"
            onChange={(event) => onChangeValue(event.target.value)}
          />
        </div>
      ) : (
        <CodeMirrorInput
          className="w-[calc(100%-140px)]"
          value={data.value}
          placeholder="value"
          onChange={(value) => onChangeValue(value ?? "")}
          onSubmit={onSubmit}
          inputType={valueInputType}
          handleCmdG={handleCmdG}
          handleCmdB={handleCmdB}
        />
      )}
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
