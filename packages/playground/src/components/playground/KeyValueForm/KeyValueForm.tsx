import type { CodeMirrorInputType } from "@/components/CodeMirrorEditor/CodeMirrorInput";
import type { KeyValueElement } from "../store";
import { KeyValueFormRow } from "./KeyValueFormRow";
import {
  createChangeEnabled,
  createChangeKey,
  createChangeValue,
  isDraftElement,
} from "./data";
import type { ChangeKeyValueElementsHandler } from "./types";

type Props = {
  keyValueElements: KeyValueElement[];
  onChange: ChangeKeyValueElementsHandler;
  onSubmit?: () => void;
  keyPlaceholder?: string;
  keyInputType?: CodeMirrorInputType;
  valueInputType?: CodeMirrorInputType;
  showFileSelector?: boolean;
  handleCmdG?: () => void;
  handleCmdB?: () => void;
};

export const KeyValueForm = (props: Props) => {
  const {
    onChange,
    keyValueElements,
    onSubmit,
    keyPlaceholder,
    keyInputType,
    valueInputType,
    handleCmdG,
    handleCmdB,
    showFileSelector = false,
  } = props;

  console.log("render", keyValueElements);
  return (
    <div className="flex flex-col gap-0">
      {keyValueElements.map((element) => {
        const isDraft = isDraftElement(element);
        return (
          <KeyValueFormRow
            key={element.id}
            keyValueData={element}
            isDraft={isDraft}
            showFileSelector={showFileSelector}
            onChangeEnabled={createChangeEnabled(
              onChange,
              keyValueElements,
              element,
            )}
            onChangeKey={createChangeKey(onChange, keyValueElements, element)}
            onChangeValue={createChangeValue(
              onChange,
              keyValueElements,
              element,
            )}
            removeValue={() => {
              onChange(keyValueElements.filter(({ id }) => element.id !== id));
            }}
            onSubmit={onSubmit}
            keyPlaceholder={keyPlaceholder}
            keyInputType={keyInputType}
            valueInputType={valueInputType}
            handleCmdG={handleCmdG}
            handleCmdB={handleCmdB}
          />
        );
      })}
    </div>
  );
};
