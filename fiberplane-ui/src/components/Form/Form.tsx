import { zodResolver } from "@hookform/resolvers/zod";
import type { ReactNode } from "react";
import {
  type Control,
  type DefaultValues,
  type FieldErrors,
  type FieldValues,
  type SubmitErrorHandler,
  type SubmitHandler,
  useForm,
} from "react-hook-form";
import styled from "styled-components";
import type { ZodSchema } from "zod";

type FormProps<TValues extends FieldValues> = {
  children: (control: Control<TValues>) => ReactNode;
  defaultValues?: DefaultValues<TValues>;
  errors?: FieldErrors<TValues>;
  schema: ZodSchema<TValues>;
  submitErrorHandler: SubmitErrorHandler<TValues>;
  submitHandler: SubmitHandler<TValues>;
};

export function Form<TValues extends FieldValues>({
  children,
  defaultValues,
  errors,
  schema,
  submitErrorHandler,
  submitHandler,
}: FormProps<TValues>) {
  const { control, handleSubmit, formState } = useForm<TValues>({
    defaultValues,
    errors,
    resolver: zodResolver(schema)
  });

  return (
    <Container onSubmit={handleSubmit(submitHandler, submitErrorHandler)}>
      {formState.errors.root && (
        <ErrorMessage>{formState.errors.root.message}</ErrorMessage>
      )}
      {children(control)}
    </Container>
  );
}

const Container = styled.form`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 16px;
`;

const ErrorMessage = styled.span`
  color: red;
`;
