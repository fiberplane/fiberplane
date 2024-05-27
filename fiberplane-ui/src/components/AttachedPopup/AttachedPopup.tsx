import { useHandler } from "@fiberplane/hooks";
import type { Placement, Rect, VirtualElement } from "@popperjs/core";
import { motion, useReducedMotion } from "framer-motion";
import {
  type ForwardedRef,
  forwardRef,
  useImperativeHandle,
  useState,
} from "react";
import { type StrictModifier, usePopper } from "react-popper";
import { styled } from "styled-components";

const ANIMATION_DISTANCE = 10;

export type OffsetsFunction = (arg0: {
  popper: Rect;
  reference: Rect;
  placement: Placement;
}) => [number | null | undefined, number | null | undefined];

export type AttachedPopupProps = {
  children: JSX.Element;

  className?: string;

  element: HTMLElement | VirtualElement | null;

  /**
   * The role attribute of the main container
   */
  role?: string;

  /**
   * Offset relative to the handle and the placement/positioning.
   *
   * It's an array with two values:
   * - value1: offset along the handle (skidding).
   * - value2: offset away from the handle (distance).
   *
   * See also: https://popper.js.org/docs/v2/modifiers/offset/
   */
  offset?: [number, number] | OffsetsFunction;

  placement?: Placement;

  /**
   * Exposes Popper's mainAxis property on the preventOverflow modifier, defaults to true.
   */
  preventMainAxisOverflow?: boolean;

  /**
   * Delay before show-animation into ui (default: 0 milliseconds)
   */
  onEnterDelayMs?: number;
};

export const AttachedPopup = forwardRef(function AttachedPopup(
  {
    children,
    element,
    className,
    offset = [0, 0],
    placement = "bottom",
    role,
    preventMainAxisOverflow = true,
    onEnterDelayMs = 0,
  }: AttachedPopupProps,
  forwardedRef: ForwardedRef<{
    update: () => Promise<void>;
  }>,
) {
  const shouldReduceMotion = useReducedMotion();

  const [content, setContent] = useState<HTMLElement | null>(null);

  const modifiers: Array<StrictModifier> = [
    { name: "offset", options: { offset } },
    {
      name: "preventOverflow",
      options: {
        padding: 8,
        mainAxis: preventMainAxisOverflow,
      },
    },
  ];

  const {
    styles,
    attributes,
    update: rawUpdate,
  } = usePopper(element, content, {
    placement,
    modifiers,
  });

  const update = useHandler(async () => {
    if (rawUpdate) {
      await rawUpdate();
    }
  });

  useImperativeHandle(forwardedRef, () => ({
    update,
  }));

  return (
    <PopperContainer
      className={className}
      ref={setContent}
      style={styles.popper}
      role={role}
      {...attributes.popper}
    >
      <motion.div
        transition={{
          duration: shouldReduceMotion ? 0 : 0.1,
          ease: "easeOut",
        }}
        variants={{
          show: {
            opacity: 1,
            x: 0,
            y: 0,
            // Only add the transition here for a nonzero and truthy delay,
            // otherwise we get weird behavior in the side nav when hovering between nav icons
            ...(onEnterDelayMs && {
              transition: {
                delay: onEnterDelayMs / 1000,
              },
            }),
          },
          hide: {
            opacity: 0,
            ...getHiddenPosition(placement),
          },
        }}
        initial="hide"
        animate="show"
        exit="hide"
      >
        {children}
      </motion.div>
    </PopperContainer>
  );
});

type HidePosition = {
  x?: number;
  y?: number;
};

function getHiddenPosition(placement: Placement): HidePosition {
  switch (placement) {
    case "top":
      return { y: ANIMATION_DISTANCE };
    case "right":
    case "right-start":
      return { x: -ANIMATION_DISTANCE };
    case "left":
      return { x: ANIMATION_DISTANCE };
    default:
      return { y: -ANIMATION_DISTANCE };
  }
}

const PopperContainer = styled(motion.div)`
  z-index: 1021;
`;
