import type { ChangeKeyValueElementsHandler } from "../../KeyValueForm/types";
import type { KeyValueElement } from "../../store";

/**
 * Return a function to immutably update an element of a {@link KeyValueElement[]} with a new `value` property.
 *
 * This function shells out to modifyKeyValuePathParameter, which has special logic for auto-enabling
 * a parameter when its value goes from falsy to truthy
 */
export function createChangePathParamValue(
  onChange: ChangeKeyValueElementsHandler,
  allParameters: KeyValueElement[],
  parameter: KeyValueElement,
) {
  return modifyKeyValuePathParameter(
    onChange,
    allParameters,
    parameter,
    (parameterToModify, newValue: string) => {
      return {
        ...parameterToModify,
        value: newValue,
      };
    },
  );
}

// Utils

/**
 * Helper to create a function that immutably updates an element of a {@link KeyValueElement[]} with a new property,
 * then calls a callback with the new array.
 */
function modifyKeyValuePathParameter<T>(
  onChange: ChangeKeyValueElementsHandler,
  allParameters: KeyValueElement[],
  parameter: KeyValueElement,
  mapNewValue: (p: KeyValueElement, newValue: T) => KeyValueElement,
) {
  return (newValue: T) => {
    const newQueryParams = allParameters.map((otherParameter) => {
      if (parameter.id === otherParameter.id) {
        const newParameter = mapNewValue(parameter, newValue);

        // When we change from draft to not draft, we want to enable the parameter
        if (!parameter.data.value && !!newParameter.data.value) {
          newParameter.enabled = true;
        }

        // If the new parameter is falsy, it cannot be enabled
        if (!newParameter.data.value) {
          newParameter.enabled = false;
        }

        return newParameter;
      }

      return otherParameter;
    });
    onChange(newQueryParams);
  };
}
