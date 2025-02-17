import { isDraftElement } from "../KeyValueForm/data";
import type { KeyValueElement } from "../store";

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
