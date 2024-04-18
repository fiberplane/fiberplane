import { useEffect, useRef } from "react";
import { css, styled } from "styled-components";
import { Input } from "../Input";

export type Props = {
  children: React.ReactNode;
  name: string;
  onSelect: (value: string) => void;
  selected?: boolean;
  value: string;
  autoFocus?: boolean;
};

export function SelectOption(props: Props): JSX.Element {
  const { children, name, onSelect, selected, value, autoFocus } = props;

  const ref = useRef<HTMLLabelElement>(null);
  useEffect(() => {
    if (autoFocus && ref.current) {
      ref.current.focus();
    }
  }, [autoFocus]);

  return (
    <Label
      role="option"
      aria-selected={selected}
      tabIndex={0}
      ref={ref}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          onSelect(value);
        }
      }}
    >
      <Input
        autoFocus={selected}
        checked={selected}
        name={name}
        onChange={() => onSelect(value)}
        type="radio"
        value={value}
      />
      {children}
    </Label>
  );
}

const Label = styled.label`
  ${({ theme }) => css`
    min-width: max-content;
    font: ${theme.font.body.md.medium};
    padding: 8px 12px;
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    cursor: pointer;
    color: ${theme.color.input.fg.default};
    border-radius: ${theme.radius.default};

    &:hover,
    &:focus {
      background-color: ${theme.color.input.bg};
    }
  `}
`;
