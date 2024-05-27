import { motion } from "framer-motion";
import {
  type ComponentPropsWithoutRef,
  type PropsWithoutRef,
  createContext,
  useContext,
} from "react";
import { css, styled } from "styled-components";

import { activeBarAnimation } from "../../animations";

type TabListProps = ComponentPropsWithoutRef<typeof TabListContainer> & {
  layoutId: string;
};

type TabProps = ComponentPropsWithoutRef<typeof StyledTab> & {
  alias: string;
  isActive?: boolean;
};

const LayoutIdContext = createContext<string | undefined>(undefined);

export function TabList({ layoutId, children, ...props }: TabListProps) {
  return (
    <LayoutIdContext.Provider value={layoutId}>
      <TabListContainer {...props}>{children}</TabListContainer>
    </LayoutIdContext.Provider>
  );
}

export function Tab({
  alias,
  children,
  isActive,
  ...props
}: PropsWithoutRef<TabProps>) {
  const layoutId = useContext(LayoutIdContext);
  return (
    <StyledTab data-key={alias} aria-selected={isActive} {...props}>
      <TabTitle>{children}</TabTitle>
      {isActive && <ActiveBar {...activeBarAnimation} layoutId={layoutId} />}
    </StyledTab>
  );
}

const TabListContainer = styled.header(
  ({ theme }) => css`
  display: flex;
  gap: 40px;
  border-bottom: 1px solid ${theme.color.border.muted};
`,
);

const StyledTab = styled.div(
  ({ theme }) => css`
    font: ${theme.fontStudioHeadingsH5ShortHand};
    letter-spacing: ${theme.fontStudioHeadingsH5LetterSpacing};
    min-width: max-content;

    text-align: center;
    color: ${theme.color.fg.subtle};
    cursor: pointer;

    &:hover {
      color: ${theme.color.fg.default};
    }

    &[aria-selected="true"] {
      color: ${theme.color.fg.primary};
    }
  `,
);

const TabTitle = styled.span`
  display: block;
  padding-bottom: 12px;
`;

const ActiveBar = styled(motion.div)(
  ({ theme }) => css`
    height: 2px;
    background: ${theme.color.border.primary};
  `,
);
