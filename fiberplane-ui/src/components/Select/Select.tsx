import type { Placement } from "@popperjs/core";
import { AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";
import { css, styled } from "styled-components";

import { useOpen } from "@fiberplane/hooks";
import { cancelEvent, noop } from "../../utils";
import { AttachedPopup } from "../AttachedPopup";
import { Button } from "../Button";
import { Icon } from "../Icon";
import { SelectOption as Option } from "./SelectOption";

type SelectProps = {
  autoFocus?: boolean;
  className?: string;

  /**
   * If `true`, selection is disabled.
   */
  disabled?: boolean;

  /**
   * Optional placement hint where to open the dropdown containing the options.
   */
  dropdownPlacement?: Placement;

  /**
   * HTML `name` used for grouping the options in the DOM.
   */
  name: string;

  onChange: (value: string) => void;

  /**
   * List of all options to select from.
   */
  options: Array<SelectOption>;

  /**
   * Optional placeholder to display if no option is selected.
   */
  placeholder?: string;

  /**
   * @deprecated still used by some field validators in old form handling
   */
  trailingIcon?: React.ElementType<React.SVGProps<SVGSVGElement>>;

  /**
   * The value of the selected option, if any.
   */
  value?: string;
};

export type SelectOption = {
  children: React.ReactNode;
  value: string;
};

export function Select({
  autoFocus,
  className,
  disabled = false,
  dropdownPlacement,
  name,
  onChange,
  options,
  placeholder,
  trailingIcon: TrailingIcon,
  value,
  ...attributes
}: SelectProps): JSX.Element {
  const containerRef = useRef<HTMLButtonElement | null>(null);
  const { opened, setOpened, modalRef } = useOpen(containerRef);

  useEffect(() => {
    if (autoFocus) {
      containerRef.current?.focus();
    }
  }, [autoFocus]);

  const selectedOption = value
    ? options.find((option) => option.value === value)
    : undefined;

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      cancelEvent(event);
      setOpened(!opened);
    }
  };

  const handleSelect = (value: string) => {
    onChange(value);
    setOpened(false);
  };

  // The `setTimeout()` is necessary to avoid what appears to be a React issue
  // that otherwise causes `handleSelect()` to be invoked immediately when the
  // dropdown is shown and any option other than the first is selected.
  // See: https://fiberplane.slack.com/archives/C01RFR1U3EC/p1677598061465209
  const onClick = () => setTimeout(() => setOpened(!opened), 10);

  return (
    <Root className={className}>
      <SelectButton
        {...attributes}
        buttonStyle="secondary"
        disabled={disabled}
        onClick={disabled ? noop : onClick}
        onKeyDown={handleKeyDown}
        ref={containerRef}
        role="combobox"
        tabIndex={disabled ? -1 : 0}
        type="button"
      >
        {selectedOption ? (
          <Value>{selectedOption.children}</Value>
        ) : (
          <Placeholder>{placeholder}</Placeholder>
        )}
        {TrailingIcon && <TrailingIcon />}
        <Icon iconType="double_arrow" />
      </SelectButton>

      <div role="listbox">
        <AnimatePresence>
          {opened && (
            <StyledAttachedPopup
              element={containerRef.current}
              placement={dropdownPlacement}
              offset={[0, 4]}
            >
              <DropdownMenu ref={modalRef}>
                {options.map((option) => (
                  <Option
                    key={option.value}
                    name={name}
                    onSelect={handleSelect}
                    selected={option === selectedOption}
                    {...option}
                  />
                ))}
              </DropdownMenu>
            </StyledAttachedPopup>
          )}
        </AnimatePresence>
      </div>
    </Root>
  );
}

const SelectButton = styled(Button)(
  ({ theme }) => css`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 100%;
  padding: 8px;
  font: ${theme.font.body.md.medium};
  color: ${theme.color.input.fg.default};
  background-color: ${theme.color.input.bg};
  border: 1px solid ${theme.color.border.default};
`,
);

const Value = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  margin-right: auto;
`;

const Placeholder = styled(Value)(
  ({ theme }) => css`
  color: ${theme.color.input.fg.placeholder};
`,
);

const StyledAttachedPopup = styled(AttachedPopup)`
  min-width: 100%;
  z-index: 1;
`;

const DropdownMenu = styled.div(
  ({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow: hidden;
    justify-content: flex-start;
    align-items: flex-start;
    flex-grow: 1;
    background-color: ${theme.color.bg.elevated.default};
    border-radius: ${theme.radius.default};
    border: 1px solid ${theme.color.border.muted};
    padding: 8px;
    box-shadow: ${theme.effect.shadow.m};
    width: 100%;
  `,
);

const Root = styled.div`
  height: min-content;
  position: relative;
`;
