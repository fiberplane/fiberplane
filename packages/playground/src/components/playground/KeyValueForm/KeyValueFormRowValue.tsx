import {
  CodeMirrorInput,
  type CodeMirrorInputType,
} from "@/components/CodeMirrorEditor/CodeMirrorInput";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FpDropdownMenu,
  FpDropdownMenuContent,
  FpDropdownMenuPortal,
  FpDropdownMenuRadioGroup,
  FpDropdownMenuTrigger,
  FpMinimalDropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { FpLabel } from "@/components/ui/label";
import { FpRadioGroup, FpRadioGroupItem } from "@/components/ui/radio-group";
import {
  type SupportedSchemaObject,
  isSupportedSchemaObject,
} from "@/lib/isOpenApi";
import { cn, isMac } from "@/utils";
import { useHandler } from "@fiberplane/hooks";
import { CaretSortIcon } from "@radix-ui/react-icons";
import { FileIcon, XIcon } from "lucide-react";
import { useRef } from "react";
import type { KeyValueElement } from "../store";

type KeyValueRowValueProps = {
  keyValueData: KeyValueElement;
  removeValue?: () => void;
  onSubmit?: () => void;
  handleCmdG?: () => void;
  handleCmdB?: () => void;
  keyPlaceholder?: string;
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

export function KeyValueFormRowValue(props: KeyValueRowValueProps) {
  const {
    showFileSelector,
    keyValueData,
    onChangeValue,
    onSubmit,
    valueInputType,
    handleCmdB,
    handleCmdG,
  } = props;
  const { data, parameter } = keyValueData;
  const schema =
    parameter.schema && isSupportedSchemaObject(parameter.schema)
      ? parameter.schema
      : undefined;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = useHandler(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!showFileSelector) {
        return;
      }
      const file = event.target.files?.[0];
      if (file) {
        onChangeValue(file);
      }
    },
  );

  return (
    <div className="w-[calc(100%-140px)] flex">
      {showFileSelector && (
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />
      )}

      <div
        className={`flex-1 grid ${showFileSelector ? "grid-cols-[1fr_20px]" : ""} items-center gap-2`}
      >
        {data.type === "file" ||
        (schema && schema.type === "string" && schema.format === "binary") ? (
          <KeyValueFile
            onChangeValue={onChangeValue}
            value={data.type === "file" ? data.value : undefined}
          />
        ) : schema?.enum ? (
          <KeyValueEnum
            enumValues={schema.enum}
            onChangeValue={onChangeValue}
            value={data.value}
          />
        ) : schema?.type === "number" || schema?.type === "integer" ? (
          <KeyValueNumber
            onChangeValue={onChangeValue}
            schema={schema}
            value={data.value}
            handleCmdB={handleCmdB}
            handleCmdG={handleCmdG}
          />
        ) : schema?.type === "boolean" ? (
          <KeyValueBoolean onChangeValue={onChangeValue} value={data.value} />
        ) : (
          <>
            <KeyValueString
              onChangeValue={onChangeValue}
              value={data.value}
              handleCmdB={handleCmdB}
              handleCmdG={handleCmdG}
              onSubmit={onSubmit}
              valueInputType={valueInputType}
            />
            {showFileSelector && (
              <div>
                <div
                  className={cn(
                    "flex",
                    "pointer-events-none group-focus-within:pointer-events-auto group-hover:pointer-events-auto",
                    "opacity-0 group-focus-within:opacity-100 group-hover:opacity-100",
                  )}
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-3.5 w-3.5 p-0.5 cursor-pointer enabled:hover:bg-transparent transition-color
        text-muted-foreground"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FileIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function KeyValueFile(props: {
  value: File | undefined;
  onChangeValue(value: File | string): void;
}) {
  const { onChangeValue, value } = props;
  const handleFileChange = useHandler(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        onChangeValue(file);
      }
    },
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="h-8 flex-grow bg-transparent shadow-none py-0 text-sm border-none">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        variant="secondary"
        className="h-8 gap-2 pl-2"
        onClick={() => {
          fileInputRef.current?.click();
        }}
      >
        <FileIcon className="w-3 h-3 mr-0" />
        {value?.name ?? <em>No file selected</em>}
      </Button>
      {value?.name && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-3.5 w-3.5 p-0.5 cursor-pointer enabled:hover:bg-transparent transition-color
text-muted-foreground"
          onClick={() => {
            onChangeValue("");
          }}
        >
          <XIcon className="w-3 h-3 mr-0" />
        </Button>
      )}
    </div>
  );
}
function KeyValueString(props: {
  value: string;
  onChangeValue(value: string): void;
  onSubmit?: () => void;
  handleCmdG?: () => void;
  handleCmdB?: () => void;
  valueInputType?: CodeMirrorInputType;
}) {
  const {
    value,
    onChangeValue,
    onSubmit,
    valueInputType,
    handleCmdB,
    handleCmdG,
  } = props;

  return (
    <div>
      <CodeMirrorInput
        value={value}
        placeholder="value"
        onChange={(value) => onChangeValue(value ?? "")}
        onSubmit={onSubmit}
        inputType={valueInputType}
        handleCmdG={handleCmdG}
        handleCmdB={handleCmdB}
      />
    </div>
  );
}

function KeyValueNumber(props: {
  value: string;
  schema: SupportedSchemaObject;
  onChangeValue(value: string): void;
  handleCmdG?: () => void;
  handleCmdB?: () => void;
  onSubmit?: () => void;
}) {
  const { value, schema, onChangeValue, handleCmdB, handleCmdG, onSubmit } =
    props;
  const { onKeyDown } = useKeyboardShortcuts({
    handleCmdB,
    handleCmdG,
    onSubmit,
  });
  // const
  return (
    <Input
      value={value}
      type="number"
      placeholder="value"
      step={schema.type === "integer" ? 1 : undefined}
      min={schema.minimum}
      max={schema.maximum}
      onKeyDown={onKeyDown}
      className="p-0 pl-1.5 border-transparent [&:not(:focus)]:no-spinner focus-visible:ring-primary shadow-none h-7 invalid:[&:not(:focus)]:border-danger invalid:[&:not(:focus)]:animate-shake"
      onChange={(event) => onChangeValue(event.target.value)}
    />
  );
}

function useKeyboardShortcuts({
  handleCmdB,
  handleCmdG,
  onSubmit,
}: {
  handleCmdG?: () => void;
  handleCmdB?: () => void;
  onSubmit?: () => void;
}) {
  const onKeyDown = useHandler((event: React.KeyboardEvent<HTMLElement>) => {
    const isMod = isMac ? event.metaKey : event.ctrlKey;
    const otherModifiers =
      event.shiftKey && event.altKey && (isMac ? event.ctrlKey : event.metaKey);
    if (!isMod || otherModifiers) {
      return;
    }

    if (handleCmdB && event.key === "b") {
      handleCmdB();
    }

    if (handleCmdG && event.key === "g") {
      handleCmdG();
    }

    if (onSubmit && event.key === "Enter") {
      onSubmit();
    }
  });

  return {
    onKeyDown,
  };
}

function KeyValueEnum(props: {
  value: string;
  enumValues: Array<string>;
  onChangeValue(value: string): void;
}) {
  const { enumValues, value, onChangeValue } = props;

  if (enumValues.length <= 4) {
    return (
      <FpRadioGroup
        defaultValue={value}
        onValueChange={(value) => onChangeValue(value)}
        className="flex flex-wrap gap-2"
      >
        {enumValues.map((enumValue) => (
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
    );
  }
  return (
    <div>
      <FpDropdownMenu>
        <FpDropdownMenuTrigger
          className={cn(
            "flex",
            "items-center",
            "gap-2",
            "h-min",
            "hover:bg-muted",
            "data-[state=open]:bg-muted",
            "rounded-sm",
            "w-full",
            "group/dropdown",
          )}
        >
          <div className="grow-1 w-full text-start text-sm text-muted-foreground px-2">
            {value || "Select an option"}
          </div>
          <CaretSortIcon className="w-3 h-3 mr-1 flex-shrink-0 opacity-0 group-hover:opacity-100 group-focus:opacity-100 group-data-[state=open]/dropdown:opacity-100" />
        </FpDropdownMenuTrigger>
        <FpDropdownMenuPortal>
          <FpDropdownMenuContent align="start">
            <FpDropdownMenuRadioGroup value={value}>
              {enumValues.map((enumValue) => (
                <FpMinimalDropdownMenuRadioItem
                  key={enumValue}
                  onSelect={() => onChangeValue(enumValue)}
                  value={enumValue}
                  className={cn(
                    "py-0.25",
                    "focus:bg-muted",
                    "aria-checked:bg-muted aria-checked:focus:text-accent-foreground",
                    "cursor-pointer",
                  )}
                >
                  <div
                    className={cn(
                      "flex-grow grid grid-cols-[2.5rem_auto] items-center gap-1 px-1 rounded-md",
                    )}
                  >
                    {enumValue}
                  </div>
                </FpMinimalDropdownMenuRadioItem>
              ))}
            </FpDropdownMenuRadioGroup>
          </FpDropdownMenuContent>
        </FpDropdownMenuPortal>
      </FpDropdownMenu>
    </div>
  );
}

function KeyValueBoolean(props: {
  value: string;
  onChangeValue(value: string): void;
}) {
  const { value, onChangeValue } = props;

  return (
    <Checkbox
      checked={value === "true"}
      className="ml-2"
      onCheckedChange={(enabled) => onChangeValue(enabled ? "true" : "false")}
    />
  );
}
