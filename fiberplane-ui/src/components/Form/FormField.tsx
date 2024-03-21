import {
  type Control,
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
  useController,
} from "react-hook-form";
import styled from "styled-components";
import { Input } from "../Input";

type FormFieldProps<
  TValues extends FieldValues,
  TFieldName extends FieldPath<TValues>,
> = {
  control: Control<TValues>;
  name: TFieldName;
  rules?: RegisterOptions<TValues, TFieldName>;
};

export function FormField<
  TValues extends FieldValues,
  TFieldName extends FieldPath<TValues>,
>({ control, name, rules }: FormFieldProps<TValues, TFieldName>) {
  const { field, fieldState } = useController({ control, name, rules });

  return (
    <>
      <label htmlFor={name}>{name}</label>
      <div>
        <Input id={name} {...field} />
        {fieldState.error && (
          <ErrorMessage>{fieldState.error.message}</ErrorMessage>
        )}
      </div>
    </>
  );
}

const ErrorMessage = styled.span`
  color: red;
`;
