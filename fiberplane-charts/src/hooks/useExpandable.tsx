import styled from "styled-components";
import { useRef, useState, useEffect } from "react";

import { Icon } from "../BaseComponents";
import { useHandler } from "./useHandler";

type Options = {
  /**
   * Default height (assumed to be in pixels).
   */
  defaultHeight: number;
};

type Result<T> = {
  /**
   * Component you should include in your output to allow the user to toggle
   * the expanded state, if relevant.
   */
  expandButton?: JSX.Element;

  /**
   * Component you may need to include in your output to display the gradient
   * to indicate the collapsed state, if relevant.
   */
  gradient?: JSX.Element;

  /**
   * Whether the expandable container is currently expanded.
   */
  isExpanded: boolean;

  /**
   * Scroll event listener to attach to the container.
   */
  onScroll: (event: React.UIEvent<T, UIEvent>) => void;

  /**
   * Ref to attach to the container.
   */
  ref: React.RefCallback<T>;
};

/**
 * Implements all the logic needed to create an expandable container.
 */
export function useExpandable<T extends HTMLElement = HTMLDivElement>({
  defaultHeight,
}: Options): Result<T> {
  const ref = useRef<T | null>(null);

  const [showExpandButton, setShowExpandButton] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showGradient, setShowGradient] = useState(false);

  const update = useHandler((element: Element) => {
    const { scrollTop, scrollHeight, clientHeight } = element;

    if (scrollHeight <= defaultHeight) {
      setShowExpandButton(false);
      setShowGradient(false);
    } else {
      setShowExpandButton(true);
      setShowGradient(scrollHeight - scrollTop >= clientHeight);
    }
  });

  // This calls update function with a tiny delay. This fixes
  // errors with the ResizeObserver loop taking too long
  const asyncUpdate = useHandler((element: Element) => {
    setTimeout(() => {
      if (ref.current !== element) {
        return;
      }

      update(element);
    }, 0);
  });

  useEffect(() => {
    return () => {
      if (ref.current) {
        unsubscribeFromNode(ref.current, asyncUpdate);
        ref.current = null;
      }
    };
  }, [asyncUpdate]);

  const setRef = useHandler((node: T | null) => {
    if (ref.current === node) {
      return;
    }

    if (ref.current) {
      unsubscribeFromNode(ref.current, asyncUpdate);
    }

    if (node) {
      subscribeToNode(node, asyncUpdate);
      update(node);
    }

    ref.current = node;
  });

  const onClickExpand = useHandler(() => {
    setIsExpanded(!isExpanded);
  });

  const onScroll = useHandler((event: React.UIEvent<T, UIEvent>) => {
    asyncUpdate(event.currentTarget);
  });

  return {
    expandButton: showExpandButton ? (
      <Expand onClick={onClickExpand} revert={isExpanded}>
        <Icon type="triangle_down" />
      </Expand>
    ) : undefined,
    gradient: showGradient ? (
      <GradientContainer>
        <Gradient />
      </GradientContainer>
    ) : undefined,
    isExpanded: isExpanded || !showExpandButton,
    onScroll,
    ref: setRef,
  };
}

type Listener = (node: Element) => void;

const listenerMap: WeakMap<Element, Set<Listener>> = new WeakMap();

let observer: ResizeObserver | undefined;

function observerCallback(entries: ResizeObserverEntry[]) {
  for (const entry of entries) {
    const listeners = listenerMap.get(entry.target);
    if (listeners) {
      for (const listener of listeners) {
        listener(entry.target);
      }
    }
  }
}

function subscribeToNode(node: Element, listener: Listener) {
  const listeners = listenerMap.get(node);
  if (listeners) {
    listeners.add(listener);
  } else {
    listenerMap.set(node, new Set([listener]));

    if (!observer) {
      observer = new ResizeObserver(observerCallback);
    }

    observer.observe(node);
  }
}

function unsubscribeFromNode(node: Element, listener: Listener) {
  const listeners = listenerMap.get(node);

  if (listeners) {
    listeners.delete(listener);

    if (listeners.size === 0) {
      listenerMap.delete(node);

      observer?.unobserve(node);
    }
  }
}

const Expand = styled.div<{ revert: boolean }>`
  color: #4797ff;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
  transform: ${({ revert }) => (revert ? "rotate(180deg)" : "none")};

  &:hover {
    cursor: pointer;
    background: rgba(71, 151, 255, 30%);
  }
`;

const Gradient = styled.div`
  width: 100%;
  position: absolute;
  bottom: 0;
  height: 39px;
  background-image: linear-gradient(
    to bottom,
    transparent,
    rgb(255 255 255 / 75%) 50%
  );
  border-bottom-right-radius: 6px;
  pointer-events: none;
`;

// The container is sticky, but zero height to prevent the gradient itself
// from reserving any space.
const GradientContainer = styled.div`
  bottom: 0;
  height: 0;
  position: sticky;
  width: 100%;
`;
