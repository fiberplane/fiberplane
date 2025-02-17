import { isDraftElement } from "../KeyValueForm/data";
import type { KeyValueElement } from "../store";
import type {
  // ChangeFormDataParametersHandler,
  DraftFormDataParameter,
  FormDataParameter,
} from "./types";

export const createParameterId = () => generateUUID();

export const initializeKeyValueFormData = (): DraftFormDataParameter[] => {
  return [];
};

// // /**
// //  * Type guard to determine if a {@link FormDataParameter} is a {@link DraftFormDataParameter}.
// //  */
// // export const isDraftElement = (
// //   parameter: FormDataParameter,
// // ): parameter is DraftFormDataParameter => {
// //   return (
// //     parameter.enabled === false &&
// //     parameter.key === "" &&
// //     parameter.value.type === "text" &&
// //     parameter.value.value === ""
// //   );
// // };

// /**
//  * Count the number of non-draft parameters in a {@link FormDataParameter} list.
//  */
// export const countElements = (parameters: KeyValueElement[]): number => {
//   return parameters.reduce((count, parameter) => {
//     if (isDraftElement(parameter)) {
//       return count;
//     }

//     return count + 1;
//   }, 0);
// };

// /**
//  * Return a function to immutably update an element of a {@link FormDataParameter} list with a new `enabled` property.
//  */
// export function createChangeEnabled(
//   onChange: ChangeFormDataParametersHandler,
//   allParameters: FormDataParameter[],
//   parameter: FormDataParameter,
// ) {
//   return modifyFormDataParameter(
//     onChange,
//     allParameters,
//     parameter,
//     (parameterToModify, enabled: boolean) => {
//       return {
//         ...parameterToModify,
//         enabled,
//       };
//     },
//   );
// }

// /**
//  * Return a function to immutably update an element of a {@link FormDataParameter[]} with a new `key` property.
//  */
// export function createChangeKey(
//   onChange: ChangeFormDataParametersHandler,
//   allParameters: FormDataParameter[],
//   parameter: FormDataParameter,
// ) {
//   return modifyFormDataParameter(
//     onChange,
//     allParameters,
//     parameter,
//     (parameterToModify, newKey: string) => {
//       return {
//         ...parameterToModify,
//         key: newKey,
//       };
//     },
//   );
// }

// /**
//  * Return a function to immutably update an element of a {@link FormDataParameter[]} with a new `value` property.
//  */
// export function createChangeValue(
//   onChange: ChangeFormDataParametersHandler,
//   allParameters: FormDataParameter[],
//   parameter: FormDataParameter,
// ) {
//   return modifyFormDataParameter(
//     onChange,
//     allParameters,
//     parameter,
//     (parameterToModify, newValue: FormDataParameter["value"]) => {
//       return {
//         ...parameterToModify,
//         value: newValue,
//       };
//     },
//   );
// }

// Utils

/**
 * Helper to create a function that immutably updates an element of a {@link FormDataParameter[]} with a new property,
 * then calls a callback with the new array.
 */
// function modifyFormDataParameter<T>(
//   onChange: ChangeFormDataParametersHandler,
//   allParameters: KeyValueElement[],
//   parameter: KeyValueElement,
//   mapNewValue: (p: KeyValueElement, newValue: T) => KeyValueElement,
// ) {
//   return (newValue: T) => {
//     const newQueryParams = allParameters.map((otherParameter) => {
//       if (parameter.id === otherParameter.id) {
//         const newParameter = mapNewValue(parameter, newValue);

//         // When we change from draft to not draft, we want to enable the parameter
//         if (isDraftElement(parameter) && !isDraftElement(newParameter)) {
//           newParameter.enabled = true;
//         }

//         return newParameter;
//       }

//       return otherParameter;
//     });
//     onChange(newQueryParams);
//   };
// }

/**
 * Quick and dirty uuid utility
 */
function generateUUID() {
  const timeStamp = new Date().getTime().toString(36);
  const randomPart = () => Math.random().toString(36).substring(2, 15);
  return `${timeStamp}-${randomPart()}-${randomPart()}`;
}

export function reduceFormDataParameters(parameters: KeyValueElement[]) {
  return parameters.reduce((o, param) => {
    if (isDraftElement(param)) {
      return o;
    }

    const { key, data, enabled } = param;
    if (!enabled) {
      return o;
    }

    if (data.type === "string") {
      o.append(key, data.value);
    } else if (data.value) {
      o.append(key, data.value, data.value.name);
    }

    return o;
  }, new FormData());
}

/**
 * NOTE - We're using this instead of enforceSingleTerminalDraftParameter
 *        in order to preserve focus on the last parameter when you delete all of a key.
 *        (Hard to explain, just know this is preferable to `enforceSingleTerminalDraftParameter` for UI behavior.)
 *
 * If the final element of the array is a {@link DraftFormDataParameter}, return the array
 * Otherwise, return the array with a new draft parameter appended.
 *
 */
export const enforceTerminalDraftParameter = (elements: KeyValueElement[]) => {
  const finalElement = elements[elements.length - 1];
  const hasTerminalDraftParameter = finalElement
    ? isDraftElement(finalElement)
    : false;
  if (hasTerminalDraftParameter) {
    return elements;
  }

  return concatDraftParameter(elements);
};

/**
 * NOTE - This is the desired behavior, but does not play nicely with focus in the UI.
 *
 * If the final element of the array is a {@link DraftFormDataParameter}, return the array
 * Otherwise, return the array with a new draft parameter appended.
 *
 * If there are multiple draft parameters, all will be filtered out, and a new draft parameter will be appended at the end.
 */
export const enforceSingleTerminalDraftParameter = (
  parameters: KeyValueElement[],
) => {
  const firstDraftParameterIndex = parameters.findIndex(isDraftElement);

  const hasSingleTeriminalDraftParameter =
    firstDraftParameterIndex + 1 === parameters.length;

  if (hasSingleTeriminalDraftParameter) {
    return parameters;
  }

  if (firstDraftParameterIndex === -1) {
    return concatDraftParameter(parameters);
  }

  const nonDraftParameters = parameters.filter((p) => !isDraftElement(p));
  return concatDraftParameter(nonDraftParameters);
};

/**
 * Helper to immutably add a {@link DraftFormDataParameter} to the end of an array.
 */
const concatDraftParameter = (parameters: KeyValueElement[]) => {
  const DRAFT_PARAMETER: DraftFormDataParameter = {
    id: createParameterId(),
    enabled: false,
    key: "",
    value: {
      type: "text",
      value: "",
    },
  };
  return [...parameters, DRAFT_PARAMETER];
};

export const createFormDataParameter = (key: string, value: string) => {
  return {
    id: createParameterId(),
    enabled: true,
    key,
    value: {
      type: "text" as const,
      value,
    },
  };
};

/**
 * Create a key value element of type T and set matching type for the value
 */
export function createKeyValueElement(
  key: string,
  value: KeyValueElement["data"]["value"],
): KeyValueElement {
  const data =
    typeof value === "string"
      ? {
          type: "string" as const,
          value: value,
        }
      : {
          type: "file" as const,
          value: value,
        };

  return {
    id: createParameterId(),
    key,
    enabled: true,
    data,
    parameter: {
      name: key,
      in: "formData",
    },
  };
}

// }
