import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn, noop } from "@/utils";
import { TrashIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import {
  createChangeEnabled,
  createChangeKey,
  createChangeValue,
  isDraftParameter,
} from "./data";
import { ChangeKeyValueParametersHandler, KeyValueParameter } from "./types";

type Props = {
  keyValueParameters: KeyValueParameter[];
  onChange: ChangeKeyValueParametersHandler;
};

type KeyValueRowProps = {
  isDraft: boolean;
  parameter: KeyValueParameter;
  onChangeEnabled: (enabled: boolean) => void;
  onChangeKey: (key: string) => void;
  onChangeValue: (value: string) => void;
  removeValue: () => void;
};

const KeyValueRow = (props: KeyValueRowProps) => {
  const {
    isDraft,
    onChangeEnabled,
    onChangeKey,
    onChangeValue,
    removeValue, // TODO - Implement removal
    parameter,
  } = props;
  const { enabled, key, value } = parameter;
  const [isHovering, setIsHovering] = useState(false);
  return (
    <div
      className="flex items-center space-x-0 rounded px-2 py-0"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <Checkbox
        className="mr-1"
        checked={enabled}
        disabled={isDraft}
        onCheckedChange={() => {
          const handler = isDraft ? noop : () => onChangeEnabled(!enabled);
          return handler();
        }}
      />
      <Input
        type="text"
        value={key}
        placeholder="name"
        onChange={(e) => onChangeKey(e.target.value)}
        className="w-24 h-8 bg-transparent shadow-none px-2 py-0 text-sm border-none focus:text-blue-600"
      />
      <Input
        type="text"
        value={value}
        placeholder="value"
        onChange={(e) => onChangeValue(e.target.value)}
        className="h-8 flex-grow bg-transparent shadow-none px-2 py-0 text-sm border-none"
      />
      <div
        className={cn("ml-1 flex invisible", {
          visible: !isDraft && isHovering,
        })}
      >
        <TrashIcon
          className={cn("w-4 h-4", {
            "cursor-pointer": !isDraft,
          })}
          onClick={() => !isDraft && removeValue()}
        />
      </div>
    </div>
  );
};

export const KeyValueForm = (props: Props) => {
  const { onChange, keyValueParameters } = props;

  return (
    <div className="space-y-2">
      {keyValueParameters.map((parameter) => {
        const isDraft = isDraftParameter(parameter);
        return (
          <KeyValueRow
            key={parameter.id}
            parameter={parameter}
            isDraft={isDraft}
            onChangeEnabled={createChangeEnabled(
              onChange,
              keyValueParameters,
              parameter,
            )}
            onChangeKey={createChangeKey(
              onChange,
              keyValueParameters,
              parameter,
            )}
            onChangeValue={createChangeValue(
              onChange,
              keyValueParameters,
              parameter,
            )}
            removeValue={() => {
              onChange(
                keyValueParameters.filter(({ id }) => parameter.id !== id),
              );
            }}
          />
        );
      })}
    </div>
  );
};
