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
import { useHandler } from "@fiberplane/hooks";
import { CaretSortIcon, TrashIcon } from "@radix-ui/react-icons";
import { FileIcon } from "lucide-react";
import { useRef } from "react";
import type { KeyValueElement } from "../store";
import { FpDropdownMenu, FpDropdownMenuContent, FpDropdownMenuPortal, FpDropdownMenuRadioGroup, FpDropdownMenuTrigger, FpMinimalDropdownMenuRadioItem } from "@/components/ui/dropdown-menu";

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
    onChangeValue,
    removeValue,
    keyValueData,
    onSubmit,
    handleCmdG,
    handleCmdB,
    keyPlaceholder = "name",
    showFileSelector,
    keyInputType,
    valueInputType,
  } = props;
  const { enabled, key, data, parameter } = keyValueData;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const schema =
    parameter.schema && isSupportedSchemaObject(parameter.schema)
      ? parameter.schema
      : undefined;

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
      ) : schema?.enum ?
        schema.enum.length <= 4 ? (
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
        ) : (
          <div className="w-[calc(100%-140px)]">
            <FpDropdownMenu>
              <FpDropdownMenuTrigger
                className={cn(
                  "flex",
                  "ml-2",
                  "items-center",
                  "gap-2",
                  "h-min",
                  "hover:bg-muted",
                  "data-[state=open]:bg-muted",
                  "rounded-sm",
                  "w-full",
                )}
              >
                <div className="grow-1 w-full text-start px-2">{data.value || "Select an option"}</div>
                <CaretSortIcon className="w-3 h-3 mr-1 flex-shrink-0" />
              </FpDropdownMenuTrigger>
              <FpDropdownMenuPortal>
                <FpDropdownMenuContent align="start">
                  <FpDropdownMenuRadioGroup
                    value={data.value}
                  >
                    {schema.enum.map((enumValue) => (
                      <FpMinimalDropdownMenuRadioItem
                        key={enumValue}
                        onSelect={() => onChangeValue(enumValue)}
                        value={enumValue}
                        className={cn(
                          "py-0.25",
                          "focus:bg-muted",
                          "aria-checked:bg-muted aria-checked:focus:text-accent-foreground",
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
          <>
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
            {showFileSelector && !data.value && (
              <div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FileIcon className="w-4 h-4" />
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            )}
          </>
        )
      }

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
    </div >
  );
};
