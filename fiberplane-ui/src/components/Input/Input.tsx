import { type HTMLInputTypeAttribute, forwardRef } from "react";

import { CheckBox } from "./Checkbox";
import { LightSwitch } from "./LightSwitch";
import { RadioButton } from "./RadioButton";
import { TextInput } from "./TextInput";

type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  type?: HTMLInputTypeAttribute | "lightswitch";
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input(props, ref) {
    switch (props.type) {
      case "checkbox":
        return <CheckBox ref={ref} {...props} />;
      case "radio":
        return <RadioButton ref={ref} {...props} />;
      case "text":
        return <TextInput ref={ref} {...props} />;
      case "lightswitch":
        return <LightSwitch ref={ref} {...props} />;
      default:
        return <input ref={ref} {...props} />;
    }
  },
);
