import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import * as React from 'react';
import { forwardRef, memo, Fragment as Fragment$1, createContext, useRef, useCallback, useState, useEffect, useReducer, useMemo, useLayoutEffect, useContext, useId } from 'react';
import styled, { css, useTheme } from 'styled-components';
import { debounce } from 'throttle-debounce';
import { localPoint } from '@visx/event';
import { scaleLinear, getTicks } from '@visx/scale';
import { Area, Bar, Line } from '@visx/shape';
import { Threshold } from '@visx/threshold';
import { AxisBottom, AxisLeft, Orientation } from '@visx/axis';
import { GridRows, GridColumns } from '@visx/grid';
import { useMotionValue, animate } from 'framer-motion';
import { utcFormat } from 'd3-time-format';
import { VariableSizeList } from 'react-window';

const ButtonGroup = styled.span`
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 4px 8px;
  background: ${({ theme  })=>theme.colorBase200};
  border-radius: ${({ theme  })=>theme.borderRadius500};
`;

const Box = styled.div`
  box-sizing: border-box;
  margin: 0;
  min-width: 0;
`;
const Container = styled(Box)`
  display: flex;
`;

const ControlsContainer = styled.div`
  display: flex;
  margin: 0 0 12px;
  gap: 24px;
`;
const ControlsGroup = styled.div`
  display: flex;
  gap: 8px;
`;
const ControlsSet = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;
const ControlsSetLabel = styled.span`
  font: ${({ theme  })=>theme.fontControlsShortHand};
  letter-spacing: ${({ theme  })=>theme.fontControlsLetterSpacing};
  color: ${({ theme  })=>theme.colorBase500};
`;

var _path$6;
function _extends$6() { _extends$6 = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$6.apply(this, arguments); }
var SvgChartBar = function SvgChartBar(props) {
  return /*#__PURE__*/React.createElement("svg", _extends$6({
    xmlns: "http://www.w3.org/2000/svg",
    width: 20,
    height: 20,
    fill: "none",
    viewBox: "0 0 20 20"
  }, props), _path$6 || (_path$6 = /*#__PURE__*/React.createElement("path", {
    fill: "currentColor",
    d: "M17.813 15.625h-.625v-12.5a.625.625 0 0 0-.625-.625h-4.375a.625.625 0 0 0-.626.625V6.25h-3.75a.625.625 0 0 0-.625.625V10h-3.75a.625.625 0 0 0-.624.625v5h-.626a.625.625 0 1 0 0 1.25h15.626a.624.624 0 1 0 0-1.25ZM8.438 7.5h3.124v8.125H8.438V7.5Zm-4.376 3.75h3.125v4.375H4.063V11.25Z"
  })));
};

var _path$5;
function _extends$5() { _extends$5 = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$5.apply(this, arguments); }
var SvgChartLine = function SvgChartLine(props) {
  return /*#__PURE__*/React.createElement("svg", _extends$5({
    xmlns: "http://www.w3.org/2000/svg",
    width: 20,
    height: 20,
    fill: "none",
    viewBox: "0 0 20 20"
  }, props), _path$5 || (_path$5 = /*#__PURE__*/React.createElement("path", {
    fill: "currentColor",
    d: "M17.5 15.625H3.125v-2.844L7.531 8.93l4.594 3.445a.625.625 0 0 0 .79-.031l5-4.375a.625.625 0 0 0-.83-.938l-4.616 4.04-4.594-3.446a.625.625 0 0 0-.79.031l-3.96 3.469V3.75a.625.625 0 0 0-1.25 0v12.5a.625.625 0 0 0 .625.625h15a.624.624 0 1 0 0-1.25Z"
  })));
};

var _path$4;
function _extends$4() { _extends$4 = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$4.apply(this, arguments); }
var SvgCheck = function SvgCheck(props) {
  return /*#__PURE__*/React.createElement("svg", _extends$4({
    xmlns: "http://www.w3.org/2000/svg",
    width: 20,
    height: 20,
    fill: "none",
    viewBox: "0 0 20 20"
  }, props), _path$4 || (_path$4 = /*#__PURE__*/React.createElement("path", {
    fill: "currentColor",
    d: "M8.125 15a.665.665 0 0 1-.445-.18l-4.375-4.375a.633.633 0 0 1 .89-.89l3.93 3.937L16.43 5.18a.633.633 0 0 1 .89.89l-8.75 8.75a.665.665 0 0 1-.445.18Z"
  })));
};

var _path$3;
function _extends$3() { _extends$3 = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$3.apply(this, arguments); }
var SvgCombined = function SvgCombined(props) {
  return /*#__PURE__*/React.createElement("svg", _extends$3({
    xmlns: "http://www.w3.org/2000/svg",
    width: 20,
    height: 20,
    fill: "none",
    viewBox: "0 0 20 20"
  }, props), _path$3 || (_path$3 = /*#__PURE__*/React.createElement("path", {
    fill: "currentColor",
    fillRule: "evenodd",
    d: "M12.157 3.794a.5.5 0 0 0-.916.011l-2.805 6.64-1.139-2.331a.5.5 0 0 0-.894-.008l-4.43 8.666a.5.5 0 0 0 .445.728h15.168a.5.5 0 0 0 .455-.706l-5.884-13Zm-.76 12.706h5.414L11.716 5.247 9.02 11.635l2.378 4.865Zm-2.894-3.643 1.78 3.643h-3.32l1.54-3.643Zm-.583-1.191L5.878 16.5H3.235l3.603-7.049 1.082 2.215Z",
    clipRule: "evenodd"
  })));
};

var _path$2;
function _extends$2() { _extends$2 = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$2.apply(this, arguments); }
var SvgPercentage = function SvgPercentage(props) {
  return /*#__PURE__*/React.createElement("svg", _extends$2({
    xmlns: "http://www.w3.org/2000/svg",
    width: 20,
    height: 20,
    fill: "none",
    viewBox: "0 0 20 20"
  }, props), _path$2 || (_path$2 = /*#__PURE__*/React.createElement("path", {
    fill: "currentColor",
    fillRule: "evenodd",
    d: "M15.354 4.646a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.708-.708l10-10a.5.5 0 0 1 .708 0ZM6.5 5.5a1 1 0 1 0 0 2 1 1 0 0 0 0-2Zm-2 1a2 2 0 1 1 4 0 2 2 0 0 1-4 0Zm8 7a1 1 0 1 1 2 0 1 1 0 0 1-2 0Zm1-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z",
    clipRule: "evenodd"
  })));
};

var _path$1;
function _extends$1() { _extends$1 = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends$1.apply(this, arguments); }
var SvgStacked = function SvgStacked(props) {
  return /*#__PURE__*/React.createElement("svg", _extends$1({
    xmlns: "http://www.w3.org/2000/svg",
    width: 20,
    height: 20,
    fill: "none",
    viewBox: "0 0 20 20"
  }, props), _path$1 || (_path$1 = /*#__PURE__*/React.createElement("path", {
    fill: "currentColor",
    fillRule: "evenodd",
    d: "M11.688 3.125a.5.5 0 0 1 .5-.5h4.374a.5.5 0 0 1 .5.5V16.25a.5.5 0 0 1-.5.5H7.885a.503.503 0 0 1-.142 0H3.438a.5.5 0 0 1-.5-.5V6.812a.5.5 0 0 1 .5-.5h3.874v-.437a.5.5 0 0 1 .5-.5h3.875v-2.25ZM7.311 7.312H3.938V11h3.376V7.312Zm0 4.688H3.938v3.75h3.376V12Zm1 3.75V6.375h3.376v9.375H8.312Zm4.376 0V3.625h3.374V15.75h-3.375Z",
    clipRule: "evenodd"
  })));
};

var _path;
function _extends() { _extends = Object.assign ? Object.assign.bind() : function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }
var SvgTriangleDown = function SvgTriangleDown(props) {
  return /*#__PURE__*/React.createElement("svg", _extends({
    xmlns: "http://www.w3.org/2000/svg",
    width: 20,
    height: 20,
    fill: "none",
    viewBox: "0 0 20 20"
  }, props), _path || (_path = /*#__PURE__*/React.createElement("path", {
    fill: "currentColor",
    d: "m10.143 13 3.344-6h-6.69l3.346 6Z"
  })));
};

const ICON_MAP = {
    chart_bar: SvgChartBar,
    chart_line: SvgChartLine,
    check: SvgCheck,
    combined: SvgCombined,
    percentage: SvgPercentage,
    stacked: SvgStacked,
    triangle_down: SvgTriangleDown
};

function Icon({ type , ...svgProps }) {
    const Component = ICON_MAP[type];
    return /*#__PURE__*/ jsx(Component, {
        ...svgProps
    });
}

const buttonStyling = css`
    --color: var(--button-normal-color);
    --backgroundColor: var(--button-normal-backgroundColor);
  
    outline: none;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition-property: background-color, border-color;
    transition-duration: 0.2s;
    transition-timing-function: linear;
    border-radius: ${({ theme  })=>theme.borderRadius500};
    box-sizing: border-box;
    height: var(--icon-button-height, 20px);
    width: var(--icon-button-width, 20px);
    padding: var(--icon-button-padding, 2px);
    color: var(--color);
    background-color: var(--background);
    border: 1px solid var(--background);
  
    :focus,
    :hover,
    :active,
    .active {
      cursor: pointer;
    }
  
    :focus {
      border-color: ${({ theme  })=>theme.colorPrimary500};
      outline: ${({ theme  })=>theme.effectFocusOutline};
  
      --background: var(--button-focus-backgroundColor);
      --color: var(--button-focus-color);
    }
  
    &:disabled {
      cursor: default;
  
      --color: var(--button-disabled-color);
      --background: var(--button-disabled-backgroundColor);
    }
  
    &.active,
    &:active:not([data-dragging], [disabled]) {
      --background: var(--button-active-backgroundColor);
      --color: var(--button-active-color);
    }
  
    :hover:not([data-disabled][data-dragging], [disabled]) {
      --background: var(--button-hover-backgroundColor);
      --color: var(--button-hover-color);
      border: none;
    }
  
    & svg {
      flex: 0 0 var(--icon-button-icon-size);
      width: var(--icon-button-icon-size);
      height: var(--icon-button-icon-size);
    }
  `;
function useIconButtonTheme(theme) {
    return {
        normal: {
            color: theme.colorBase800,
            backgroundColor: "transparent"
        },
        hover: {
            color: theme.colorBase800,
            backgroundColor: theme.colorBase300
        },
        active: {
            color: theme.colorBackground,
            backgroundColor: theme.colorBase600
        },
        focus: {
            color: theme.colorBase600,
            backgroundColor: theme.colorBackground
        },
        disabled: {
            color: theme.colorBase500,
            backgroundColor: "transparent"
        }
    };
}
const StyledButton = styled.button`
  ${buttonStyling}
`;
const buttonSize = {
    padding: "6px",
    width: "32px",
    height: "32px",
    iconSize: "20px"
};
const IconButton = /*#__PURE__*/ forwardRef(function IconButton(props, ref) {
    const { className ="" , style ={} , active =false , children , ...otherProps } = props;
    const theme = useTheme();
    const iconButtonTheme = useIconButtonTheme(theme);
    const newStyle = {
        ...style,
        "--icon-button-padding": buttonSize.padding,
        "--icon-button-width": buttonSize.width,
        "--icon-button-height": buttonSize.height,
        "--icon-button-icon-size": buttonSize.iconSize,
        "--button-normal-color": iconButtonTheme.normal.color,
        "--button-normal-backgroundColor": iconButtonTheme.normal.backgroundColor,
        "--button-hover-color": iconButtonTheme.hover.color,
        "--button-hover-backgroundColor": iconButtonTheme.hover.backgroundColor,
        "--button-active-color": iconButtonTheme.active.color,
        "--button-active-backgroundColor": iconButtonTheme.active.backgroundColor,
        "--button-focus-color": iconButtonTheme.focus.color,
        "--button-focus-backgroundColor": iconButtonTheme.focus.backgroundColor,
        "--button-disabled-color": iconButtonTheme.disabled.color,
        "--button-disabled-backgroundColor": iconButtonTheme.disabled.backgroundColor
    };
    const elementProps = {
        ...otherProps,
        ref,
        style: newStyle,
        className: active ? `${className} active` : className,
        "aria-pressed": active
    };
    return /*#__PURE__*/ jsx(StyledButton, {
        ...elementProps,
        children: children
    });
});

/**
 * Strips all falsy values from an array.
 */ function compact(items) {
    return items.filter(Boolean);
}

/**
 * Return a list of keys whose values vary across series (or don't exist
 * everywhere).
 */ function findUniqueKeys(timeseriesData) {
    let constantKeys;
    let detectedValues = {};
    for (const timeseries of timeseriesData){
        const keys = Object.keys(timeseries.labels);
        if (constantKeys === undefined) {
            constantKeys = new Set(keys);
            detectedValues = {
                ...timeseries.labels
            };
        } else {
            for (const key of keys){
                if (detectedValues[key] !== timeseries.labels[key]) {
                    constantKeys.delete(key);
                }
                detectedValues[key] = timeseries.labels[key] || "";
            }
        }
    }
    const allKeys = Object.keys(detectedValues);
    return allKeys.filter((key)=>constantKeys === undefined || constantKeys.has(key) === false);
}

/**
 * Sorts an array ascending by priority.
 *
 * *Warning:* As this function uses `Array#sort()` it also mutates the input
 * array.
 */ function sortBy(array, getPriorityFn, reverse = false) {
    return array.sort((a, b)=>{
        const priorityA = getPriorityFn(a);
        const priorityB = getPriorityFn(b);
        if (priorityA < priorityB) {
            return reverse === true ? 1 : -1;
        } else if (priorityA > priorityB) {
            return reverse === true ? -1 : 1;
        } else {
            return 0;
        }
    });
}

const Emphasis = styled.span`
  background-color: ${({ theme  })=>theme.colorBase200};
  /* TODO (Jacco): we should try and find out what to do with this styling */
  /* stylelint-disable-next-line scale-unlimited/declaration-strict-value */
  font-weight: 600;
  border-radius: ${({ theme  })=>theme.borderRadius500};
  padding: 1px 4px;
  display: inline-block;
`;
const FormattedTimeseries = /*#__PURE__*/ memo(function FormattedTimeseries({ metric , sortLabels =true , emphasizedKeys =[]  }) {
    const { name , labels  } = metric;
    let labelEntries = Object.entries(labels);
    if (sortLabels) {
        labelEntries = sortBy(labelEntries, ([key])=>key);
    }
    return /*#__PURE__*/ jsxs(Fragment, {
        children: [
            name && `${name}: `,
            labelEntries.map(([key, value], index)=>/*#__PURE__*/ jsxs(Fragment$1, {
                    children: [
                        index > 0 && ", ",
                        /*#__PURE__*/ jsxs("span", {
                            className: key in emphasizedKeys ? "emphasize" : "",
                            children: [
                                key,
                                value && [
                                    ": ",
                                    emphasizedKeys.includes(key) ? /*#__PURE__*/ jsx(Emphasis, {
                                        children: value
                                    }, key) : value
                                ]
                            ]
                        })
                    ]
                }, key))
        ]
    });
});

function getShapeListColor(colors, listIndex) {
    return colors[listIndex % colors.length];
}

/**
 * Returns the input value, also known as the identity function.
 */ function identity(input) {
    return input;
}

/**
 * Taken from: https://github.com/gregberge/react-merge-refs
 *
 * Copyright (c) 2020 Greg Bergé
 *
 * @license MIT
 */ function mergeRefs(refs) {
    return (value)=>{
        for (const ref of refs){
            if (typeof ref === "function") {
                ref(value);
            } else if (ref != null) {
                ref.current = value;
            }
        }
    };
}

function noop() {}

function preventDefault(event) {
    event.preventDefault();
}

const secondsToTimestamp = (seconds)=>new Date(seconds * 1000).toISOString();
const timestampToSeconds = (timestamp)=>new Date(timestamp).getTime() / 1000;

const os = typeof navigator === "undefined" ? "" : navigator.platform.match(/mac|win|linux/i)?.[0]?.toLowerCase();
const isMac = os === "mac";

/**
 * Control what kind fo chart you're viewing (and more)
 */ function ChartControls({ graphType , onChangeGraphType , onChangeStackingType , stackingControlsShown , stackingType  }) {
    if (!onChangeGraphType && !onChangeStackingType) {
        return null;
    }
    return /*#__PURE__*/ jsxs(ControlsContainer, {
        children: [
            /*#__PURE__*/ jsxs(ControlsGroup, {
                children: [
                    onChangeGraphType && /*#__PURE__*/ jsxs(ControlsSet, {
                        children: [
                            /*#__PURE__*/ jsx(ControlsSetLabel, {
                                children: "Type"
                            }),
                            /*#__PURE__*/ jsxs(ButtonGroup, {
                                children: [
                                    /*#__PURE__*/ jsx(IconButton, {
                                        active: graphType === "line",
                                        "aria-label": "Line chart",
                                        className: "iconButton",
                                        onClick: (event)=>{
                                            preventDefault(event);
                                            onChangeGraphType("line");
                                        },
                                        children: /*#__PURE__*/ jsx(Icon, {
                                            type: "chart_line"
                                        })
                                    }),
                                    /*#__PURE__*/ jsx(IconButton, {
                                        active: graphType === "bar",
                                        "aria-label": "Bar chart",
                                        className: "iconButton",
                                        onClick: (event)=>{
                                            preventDefault(event);
                                            onChangeGraphType("bar");
                                        },
                                        children: /*#__PURE__*/ jsx(Icon, {
                                            type: "chart_bar"
                                        })
                                    })
                                ]
                            })
                        ]
                    }),
                    stackingControlsShown && onChangeStackingType && /*#__PURE__*/ jsxs(ControlsSet, {
                        children: [
                            /*#__PURE__*/ jsx(ControlsSetLabel, {
                                children: "Stacking"
                            }),
                            /*#__PURE__*/ jsxs(ButtonGroup, {
                                children: [
                                    /*#__PURE__*/ jsx(IconButton, {
                                        active: stackingType === "none",
                                        "aria-label": "Combined/default",
                                        className: "iconButton",
                                        onClick: (event)=>{
                                            preventDefault(event);
                                            onChangeStackingType("none");
                                        },
                                        children: /*#__PURE__*/ jsx(Icon, {
                                            type: "combined"
                                        })
                                    }),
                                    /*#__PURE__*/ jsx(IconButton, {
                                        active: stackingType === "stacked",
                                        "aria-label": "Stacked",
                                        className: "iconButton",
                                        type: "button",
                                        onClick: (event)=>{
                                            preventDefault(event);
                                            onChangeStackingType("stacked");
                                        },
                                        children: /*#__PURE__*/ jsx(Icon, {
                                            type: "stacked"
                                        })
                                    }),
                                    /*#__PURE__*/ jsx(IconButton, {
                                        active: stackingType === "percentage",
                                        "aria-label": "Stacked/percentage",
                                        className: "iconButton",
                                        onClick: (event)=>{
                                            preventDefault(event);
                                            onChangeStackingType("percentage");
                                        },
                                        children: /*#__PURE__*/ jsx(Icon, {
                                            type: "percentage"
                                        })
                                    })
                                ]
                            })
                        ]
                    })
                ]
            }, "core"),
            /*#__PURE__*/ jsx(ControlsGroup, {}, "meta")
        ]
    });
}

/**
 * Context for tracking the size of the chart.
 */ const ChartSizeContext = createContext({
    width: 0,
    height: 0,
    xMax: 0,
    yMax: 0,
    marginTop: 0,
    marginRight: 0,
    marginBottom: 0,
    marginLeft: 0
});

/**
 * Context that handles the result of useCoreControls hooks
 */ const CoreControlsContext = createContext({
    zoom () {},
    move () {}
});

const defaultControlsState = {
    type: "none"
};
/**
 * Holds the interactive control state as returned by the useInteractiveControlState
 */ const InteractiveControlsStateContext = createContext(defaultControlsState);
/**
 * One of two parts of the useInteractiveControlState hook results
 *
 * This is the api/functional part
 */ const InteractiveControlsApiContext = createContext({
    reset () {},
    startDrag () {},
    startZoom () {},
    updateEndValue () {}
});

const noDeps = [];
function useHandler(handler) {
    const handlerRef = useRef(handler);
    handlerRef.current = handler;
    // @ts-ignore
    // rome-ignore lint/nursery/useHookAtTopLevel: https://github.com/rome/tools/issues/4483
    return useCallback((...args)=>handlerRef.current(...args), noDeps);
}

/**
 * Implements all the logic needed to create an expandable container.
 */ function useExpandable({ defaultHeight  }) {
    const ref = useRef(null);
    const [showExpandButton, setShowExpandButton] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showGradient, setShowGradient] = useState(false);
    const update = useHandler((element)=>{
        const { scrollTop , scrollHeight , clientHeight  } = element;
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
    const asyncUpdate = useHandler((element)=>{
        setTimeout(()=>{
            if (ref.current !== element) {
                return;
            }
            update(element);
        }, 0);
    });
    useEffect(()=>{
        return ()=>{
            if (ref.current) {
                unsubscribeFromNode(ref.current, asyncUpdate);
                ref.current = null;
            }
        };
    }, [
        asyncUpdate
    ]);
    const setRef = useHandler((node)=>{
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
    const onClickExpand = useHandler(()=>{
        setIsExpanded(!isExpanded);
    });
    const onScroll = useHandler((event)=>{
        asyncUpdate(event.currentTarget);
    });
    return {
        expandButton: showExpandButton ? /*#__PURE__*/ jsx(Expand, {
            onClick: onClickExpand,
            revert: isExpanded,
            children: /*#__PURE__*/ jsx(Icon, {
                type: "triangle_down"
            })
        }) : undefined,
        gradient: showGradient ? /*#__PURE__*/ jsx(GradientContainer, {
            children: /*#__PURE__*/ jsx(Gradient, {})
        }) : undefined,
        isExpanded: isExpanded || !showExpandButton,
        onScroll,
        ref: setRef
    };
}
const listenerMap = new WeakMap();
let observer;
function observerCallback(entries) {
    for (const entry of entries){
        const listeners = listenerMap.get(entry.target);
        if (listeners) {
            for (const listener of listeners){
                listener(entry.target);
            }
        }
    }
}
function subscribeToNode(node, listener) {
    const listeners = listenerMap.get(node);
    if (listeners) {
        listeners.add(listener);
    } else {
        listenerMap.set(node, new Set([
            listener
        ]));
        if (!observer) {
            observer = new ResizeObserver(observerCallback);
        }
        observer.observe(node);
    }
}
function unsubscribeFromNode(node, listener) {
    const listeners = listenerMap.get(node);
    if (listeners) {
        listeners.delete(listener);
        if (listeners.size === 0) {
            listenerMap.delete(node);
            observer?.unobserve(node);
        }
    }
}
const Expand = styled.div`
  color: #4797ff;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
  transform: ${({ revert  })=>revert ? "rotate(180deg)" : "none"};

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

const reducer = (counter)=>counter + 1;
function useForceUpdate() {
    const [, forceUpdate] = useReducer(reducer, 0);
    return forceUpdate;
}

const noEntries = [];
function useIntersectionObserver(ref, options) {
    const [intersections, setIntersections] = useState(noEntries);
    const element = ref.current;
    useEffect(()=>{
        if (!element) {
            return;
        }
        const observer = new IntersectionObserver(setIntersections, options);
        observer.observe(element);
        return ()=>{
            observer.disconnect();
            setIntersections(noEntries);
        };
    }, [
        element,
        options
    ]);
    return intersections;
}

const defaultDimensions = {
    width: 0,
    height: 0
};
function useMeasure() {
    const [element, setElement] = useState(null);
    const [rect, setRect] = useState(defaultDimensions);
    const observer = useMemo(()=>new window.ResizeObserver((entries)=>{
            const entry = entries[0];
            if (entry) {
                const { width , height  } = entry.contentRect;
                setRect({
                    width,
                    height
                });
            }
        }), []);
    useLayoutEffect(()=>{
        if (!element) {
            return;
        }
        observer.observe(element);
        return ()=>{
            observer.disconnect();
        };
    }, [
        element,
        observer
    ]);
    return [
        setElement,
        rect
    ];
}

function ChartSizeContainerProvider({ children , className , overrideHeight , marginTop =0 , marginRight =0 , marginBottom =0 , marginLeft =0  }) {
    const [measureRef, { width , height: measuredHeight  }] = useMeasure();
    const intersectionRef = useRef(null);
    const ref = mergeRefs([
        measureRef,
        intersectionRef
    ]);
    const intersections = useIntersectionObserver(intersectionRef, intersectionOptions);
    const [value, setValue] = useState({
        xMax: 0,
        yMax: 0,
        width: 0,
        height: 0,
        marginTop,
        marginRight,
        marginBottom,
        marginLeft
    });
    const height = overrideHeight ?? measuredHeight;
    const updateValue = useMemo(()=>debounce(100, (width, height)=>setValue({
                xMax: width - marginLeft - marginRight,
                yMax: height - marginTop - marginBottom,
                width,
                height,
                marginTop,
                marginRight,
                marginBottom,
                marginLeft
            })), [
        marginTop,
        marginRight,
        marginBottom,
        marginLeft
    ]);
    useEffect(()=>{
        updateValue(width, height);
    }, [
        width,
        height,
        updateValue
    ]);
    return /*#__PURE__*/ jsx("div", {
        ref: ref,
        className: className,
        children: value.width > 0 && value.height > 0 && intersections.some((intersection)=>intersection.isIntersecting) ? /*#__PURE__*/ jsx(ChartSizeContext.Provider, {
            value: value,
            children: children
        }) : /*#__PURE__*/ jsx(ChartSkeleton, {
            height: height
        })
    });
}
function ChartSkeleton({ height  }) {
    return /*#__PURE__*/ jsx("div", {
        style: {
            height
        }
    });
}
const intersectionOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0
};

const MIN_DURATION = 60; // in seconds
/**
 * Hook for creating convenient move/zoom functions
 */ function useCoreControls({ timeRange , onChangeTimeRange  }) {
    /**
   * Moves the time scale.
   *
   * @param deltaRatio The delta to move as a ratio of the current time scale
   *                   window. -1 moves a full window to the left, and 1 moves
   *                   a full window to the right.
   */ const move = useHandler((deltaRatio)=>{
        const currentFrom = timestampToSeconds(timeRange.from);
        const currentTo = timestampToSeconds(timeRange.to);
        const delta = deltaRatio * (currentTo - currentFrom);
        const from = secondsToTimestamp(currentFrom + delta);
        const to = secondsToTimestamp(currentTo + delta);
        onChangeTimeRange?.({
            from,
            to
        });
    });
    /**
   * Zooms into or out from the graph.
   *
   * @param factor The zoom factor. Anything below 1 makes the time scale
   *               smaller (zooming in), and anything above 1 makes the time
   *               scale larger (zooming out).
   * @param focusRatio The horizontal point on which to focus the zoom,
   *                   expressed as a ratio from 0 (left-hand side of the graph)
   *                   to 1 (right-hand side of the graph).
   */ const zoom = useHandler((factor, focusRatio = 0.5)=>{
        const currentFrom = timestampToSeconds(timeRange.from);
        const currentTo = timestampToSeconds(timeRange.to);
        const duration = currentTo - currentFrom;
        const focusTimestamp = currentFrom + focusRatio * duration;
        const newDuration = Math.max(duration * factor, MIN_DURATION);
        const from = secondsToTimestamp(focusTimestamp - newDuration * focusRatio);
        const to = secondsToTimestamp(focusTimestamp + newDuration * (1 - focusRatio));
        onChangeTimeRange?.({
            from,
            to
        });
    });
    // rome-ignore lint/nursery/useHookAtTopLevel: https://github.com/rome/tools/issues/4483
    return useMemo(()=>({
            move,
            zoom
        }), [
        move,
        zoom
    ]);
}

/**
 * Returns zoom/drag handlers and state.
 */ function useInteractiveControls() {
    const [interactiveControlsState, dispatch] = useReducer(controlsStateReducer, defaultControlsState);
    const interactiveControls = useMemo(()=>({
            reset () {
                dispatch({
                    type: "RESET"
                });
            },
            startDrag (start) {
                dispatch({
                    type: "DRAG_START",
                    payload: {
                        start
                    }
                });
            },
            startZoom (start) {
                dispatch({
                    type: "ZOOM_START",
                    payload: {
                        start
                    }
                });
            },
            updateEndValue (end) {
                dispatch({
                    type: "UPDATE_END_VALUE",
                    payload: {
                        end
                    }
                });
            }
        }), []);
    return {
        interactiveControls,
        interactiveControlsState
    };
}
function controlsStateReducer(state, action) {
    switch(action.type){
        case "RESET":
            return defaultControlsState;
        case "DRAG_START":
            return {
                type: "drag",
                start: action.payload.start
            };
        case "ZOOM_START":
            return {
                type: "zoom",
                start: action.payload.start
            };
        case "UPDATE_END_VALUE":
            if (state.type === "none") {
                return state;
            }
            return {
                type: state.type,
                start: state.start,
                end: action.payload.end
            };
        default:
            return state;
    }
}

// Dimensions.
const HEIGHT = 275;
const MARGINS = {
    top: 0,
    bottom: 20,
    left: 38,
    right: 0
};

/**
 * Hook for setting up mouse handlers to control dragging & zoom
 */ function useMouseControls({ timeRange , onChangeTimeRange , xMax , yMax  }) {
    const { move , zoom  } = useContext(CoreControlsContext);
    const { startDrag , startZoom , reset , updateEndValue  } = useContext(InteractiveControlsApiContext);
    const controlsState = useContext(InteractiveControlsStateContext);
    const graphContentRef = useRef(null);
    const onMouseDown = (event)=>{
        if (event.buttons !== 1 || !onChangeTimeRange) {
            return;
        }
        preventDefault(event);
        if (!graphContentRef.current) {
            return;
        }
        const point = localPoint(graphContentRef.current, event);
        if (!point) {
            return;
        }
        let { x , y  } = point;
        x -= MARGINS.left;
        y -= MARGINS.top;
        if (x >= 0 && x <= xMax && y >= 0 && y <= yMax) {
            if (zoomKeyPressed(event)) {
                startZoom(x);
            } else if (event.shiftKey) {
                startDrag(x);
            }
        }
    };
    const onMouseMove = (event)=>{
        preventDefault(event);
        if (controlsState.type === "none") {
            return;
        }
        if (controlsState.type === "drag" && !event.shiftKey || controlsState.type === "zoom" && !zoomKeyPressed(event)) {
            reset();
            return;
        }
        if (!graphContentRef.current) {
            return;
        }
        const point = localPoint(graphContentRef.current, event);
        if (!point) {
            return;
        }
        let { x , y  } = point;
        x -= MARGINS.left;
        y -= MARGINS.top;
        if (x >= 0 && x <= xMax && y >= 0 && y <= yMax) {
            updateEndValue(x);
        }
    };
    const onMouseUp = (event)=>{
        if (event.button !== 0) {
            return;
        }
        preventDefault(event);
        if (controlsState.type === "none") {
            return;
        }
        if (controlsState.type === "zoom") {
            const { start , end  } = controlsState;
            if (end !== undefined && start !== end) {
                const positionToSeconds = (x)=>timestampToSeconds(timeRange.from) + x / xMax * (timestampToSeconds(timeRange.to) - timestampToSeconds(timeRange.from));
                const positionToTimestamp = (x)=>secondsToTimestamp(positionToSeconds(x));
                const from = positionToTimestamp(Math.min(start, end));
                const to = positionToTimestamp(Math.max(start, end));
                onChangeTimeRange?.({
                    from,
                    to
                });
            }
        } else if (controlsState.type === "drag") {
            const { start , end  } = controlsState;
            if (end !== undefined && start !== end) {
                move((start - end) / xMax);
            }
        }
        reset();
    };
    const onWheel = (event)=>{
        if (controlsState.type !== "none" || !zoomKeyPressed(event)) {
            return;
        }
        startZoom(null);
        const graphContent = graphContentRef.current;
        if (!graphContent) {
            return;
        }
        const rect = graphContent.getClientRects()[0];
        const x = event.pageX - (rect?.left ?? 0);
        if (x < 0 || x > xMax) {
            return;
        }
        preventDefault(event);
        const factor = event.deltaY < 0 ? 0.5 : 2;
        const focusRatio = x / xMax;
        zoom(factor, focusRatio);
    };
    const onMouseEnter = (event)=>{
        const { currentTarget  } = event;
        currentTarget.addEventListener("wheel", onWheel);
        currentTarget.addEventListener("mouseleave", ()=>{
            currentTarget.removeEventListener("wheel", onWheel);
        });
    };
    return {
        onMouseDown,
        onMouseMove,
        onMouseUp,
        onMouseEnter,
        graphContentRef
    };
}
function zoomKeyPressed(event) {
    return isMac ? event.metaKey : event.ctrlKey;
}

/**
 * Returns the scales to use for rendering VisX components.
 *
 * Fortunately for us, our abstract charts are normalized along both axes to
 * values from 0.0 to 1.0, meaning we can suffice with trivial linear scales.
 */ function useScales(xMax, yMax) {
    // rome-ignore lint/nursery/useHookAtTopLevel: https://github.com/rome/tools/issues/4483
    return useMemo(()=>{
        const xScale = scaleLinear({
            range: [
                0,
                xMax
            ],
            round: false,
            nice: false,
            domain: [
                0,
                1
            ]
        });
        const yScale = scaleLinear({
            range: [
                yMax,
                0
            ],
            round: false,
            nice: false,
            domain: [
                0,
                1
            ]
        });
        return {
            xMax,
            xScale,
            yMax,
            yScale
        };
    }, [
        xMax,
        yMax
    ]);
}

function useTooltip(showTooltipFn) {
    const [graphTooltip, setGraphTooltip] = useState(null);
    useRef(null);
    return {
        graphTooltip,
        onMouseMove: (_event)=>{
        // TODO
        },
        onMouseLeave: (_event)=>{
        // TODO
        }
    };
}

const AreaShape = /*#__PURE__*/ memo(function AreaShape({ anyFocused , area , color , focused , scales  }) {
    const id = useId();
    const gradientId = `line-${id}`;
    const fillColor = `url(#${gradientId})`;
    const getX = (point)=>scales.xScale(point.x);
    const getY0 = (point)=>scales.yScale(point.yMin);
    const getY1 = (point)=>scales.yScale(point.yMax);
    return /*#__PURE__*/ jsxs("g", {
        opacity: focused || !anyFocused ? 1 : 0.2,
        children: [
            /*#__PURE__*/ jsx("defs", {
                children: /*#__PURE__*/ jsxs("linearGradient", {
                    id: gradientId,
                    children: [
                        /*#__PURE__*/ jsx("stop", {
                            offset: "0%",
                            stopColor: color,
                            stopOpacity: 0.15
                        }),
                        /*#__PURE__*/ jsx("stop", {
                            offset: "80%",
                            stopColor: color,
                            stopOpacity: 0.03
                        })
                    ]
                })
            }),
            /*#__PURE__*/ jsx(Threshold, {
                id: id,
                data: area.points,
                x: getX,
                y0: getY0,
                y1: getY1,
                clipAboveTo: 0,
                clipBelowTo: getY1,
                aboveAreaProps: {
                    fill: fillColor
                },
                // Keep this one around to spot any incorrect threshold computations.
                belowAreaProps: {
                    fill: "violet"
                }
            }),
            /*#__PURE__*/ jsx(Area, {
                data: area.points,
                x: getX,
                y0: getY0,
                y1: getY1,
                stroke: color,
                strokeWidth: focused ? 1.5 : 1,
                fill: fillColor
            })
        ]
    });
});

const LineShape = /*#__PURE__*/ memo(function LineShape({ anyFocused , color , focused , line , scales  }) {
    const id = useId();
    const gradientId = `line-${id}`;
    const fillColor = `url(#${gradientId})`;
    const getX = (point)=>scales.xScale(point.x);
    const getY = (point)=>scales.yScale(point.y);
    return /*#__PURE__*/ jsxs("g", {
        opacity: focused || !anyFocused ? 1 : 0.2,
        children: [
            /*#__PURE__*/ jsx("defs", {
                children: /*#__PURE__*/ jsxs("linearGradient", {
                    id: gradientId,
                    children: [
                        /*#__PURE__*/ jsx("stop", {
                            offset: "0%",
                            stopColor: color,
                            stopOpacity: 0.15
                        }),
                        /*#__PURE__*/ jsx("stop", {
                            offset: "23%",
                            stopColor: color,
                            stopOpacity: 0.03
                        })
                    ]
                })
            }),
            /*#__PURE__*/ jsx(Threshold, {
                id: id,
                data: line.points,
                x: getX,
                y0: getY,
                y1: scales.yScale(0),
                clipAboveTo: 0,
                clipBelowTo: scales.yMax,
                aboveAreaProps: {
                    fill: fillColor
                },
                // Keep this one around to spot any incorrect threshold computations.
                belowAreaProps: {
                    fill: "violet"
                }
            }),
            /*#__PURE__*/ jsx(Area, {
                data: line.points,
                x: getX,
                y: getY,
                stroke: color,
                strokeWidth: focused ? 1.5 : 1,
                fill: fillColor
            })
        ]
    });
});

const PointShape = /*#__PURE__*/ memo(function PointShape({ color , focused , point , scales  }) {
    return /*#__PURE__*/ jsx("circle", {
        x: scales.xScale(point.x),
        y: scales.yScale(point.y),
        radius: focused ? 2 : 1,
        stroke: color,
        fill: color
    });
});

const RectangleShape = /*#__PURE__*/ memo(function RectangleShape({ anyFocused , color , focused , rectangle , scales: { xMax , yMax  }  }) {
    const height = rectangle.height * yMax;
    return /*#__PURE__*/ jsx("rect", {
        x: rectangle.x * xMax,
        y: yMax - rectangle.y * yMax - height,
        width: rectangle.width * xMax,
        height: height,
        stroke: color,
        fill: color,
        fillOpacity: 0.1,
        opacity: focused || !anyFocused ? 1 : 0.2
    });
});

function ChartShape({ shape , ...props }) {
    switch(shape.type){
        case "area":
            return /*#__PURE__*/ jsx(AreaShape, {
                area: shape,
                ...props
            });
        case "line":
            return /*#__PURE__*/ jsx(LineShape, {
                line: shape,
                ...props
            });
        case "point":
            return /*#__PURE__*/ jsx(PointShape, {
                point: shape,
                ...props
            });
        case "rectangle":
            return /*#__PURE__*/ jsx(RectangleShape, {
                rectangle: shape,
                ...props
            });
    }
}

function ChartContent({ chart , colors , focusedShapeList , scales  }) {
    return /*#__PURE__*/ jsxs(Fragment, {
        children: [
            chart.shapeLists.flatMap((shapeList, listIndex)=>shapeList.shapes.map((shape, shapeIndex)=>/*#__PURE__*/ jsx(ChartShape, {
                        anyFocused: !!focusedShapeList,
                        color: getShapeListColor(colors, listIndex),
                        focused: shapeList === focusedShapeList,
                        scales: scales,
                        shape: shape
                    }, `${listIndex}-${shapeIndex}`))),
            /*#__PURE__*/ jsx(Bar, {
                width: scales.xMax,
                height: scales.yMax,
                fill: "transparent"
            })
        ]
    });
}

const Bottom = /*#__PURE__*/ memo(function Bottom({ strokeDasharray , xScale , yMax  }) {
    const { colorBase300 , colorBase500 , fontAxisFontSize , fontAxisFontFamily , fontAxisFontStyle , fontAxisFontWeight , fontAxisLetterSpacing , fontAxisLineHeight  } = useTheme();
    const axisBottomTickLabelProps = {
        textAnchor: "middle",
        fontFamily: fontAxisFontFamily,
        fontStyle: fontAxisFontStyle,
        fontWeight: fontAxisFontWeight,
        fontSize: fontAxisFontSize,
        letterSpacing: fontAxisLetterSpacing,
        lineHeight: fontAxisLineHeight,
        fill: colorBase500
    };
    const formatter = useMemo(()=>getTimeFormatter(xScale), [
        xScale
    ]);
    return /*#__PURE__*/ jsx(AxisBottom, {
        top: yMax,
        scale: xScale,
        stroke: colorBase300,
        hideTicks: true,
        tickFormat: formatter,
        tickLabelProps: axisBottomTickLabelProps,
        strokeDasharray: strokeDasharray
    });
});
function getTimeFormatter(scale) {
    const ticks = getTicks(scale, 10);
    if (ticks.length === 0) {
        return (item)=>item.toString();
    }
    const first = ticks[0];
    const second = ticks[1];
    const timeScale = first !== undefined && second !== undefined ? getTimeScale(first, second) : "hours";
    const formatter = getFormatter(timeScale);
    return (item)=>{
        const value = new Date(item.valueOf());
        return formatter(value);
    };
}
function getTimeScale(time1, time2) {
    const delta = time2.valueOf() - time1.valueOf();
    if (delta < 1000) {
        return "milliseconds";
    } else if (delta < 60 * 1000) {
        return "seconds";
    } else if (delta < 60 * 60 * 1000) {
        return "minutes";
    } else if (delta < 24 * 60 * 60 * 1000) {
        return "hours";
    } else {
        return "days";
    }
}
function getFormatter(unit) {
    switch(unit){
        case "milliseconds":
            return utcFormat(".%L");
        case "seconds":
            return utcFormat(":%S");
        case "minutes":
            return utcFormat("%I:%M");
        case "hours":
            return utcFormat("%I %p");
        case "days":
            return utcFormat("%a %d");
    }
}

const GridWithAxes = /*#__PURE__*/ memo(function GridWithAxes({ gridColumnsShown =true , gridRowsShown =true , gridBordersShown =true , gridDashArray , gridStrokeColor , scales: { xMax , xScale , yMax , yScale  }  }) {
    const [targetLower = 0, targetUpper = 0] = yScale.domain();
    const { colorBase300  } = useTheme();
    const strokeColor = gridStrokeColor || colorBase300;
    const lower = useCustomSpring(targetLower);
    const upper = useCustomSpring(targetUpper);
    const temporaryScale = yScale.copy().domain([
        lower,
        upper
    ]);
    const ticks = temporaryScale.ticks();
    const { colorBase500 , fontAxisFontSize , fontAxisFontFamily , fontAxisFontStyle , fontAxisFontWeight , fontAxisLetterSpacing , fontAxisLineHeight  } = useTheme();
    const axisLeftTickLabelProps = {
        dx: "-0.25em",
        dy: "0.25em",
        textAnchor: "end",
        fontFamily: fontAxisFontFamily,
        fontStyle: fontAxisFontStyle,
        fontWeight: fontAxisFontWeight,
        fontSize: fontAxisFontSize,
        letterSpacing: fontAxisLetterSpacing,
        lineHeight: fontAxisLineHeight,
        fill: colorBase500
    };
    return /*#__PURE__*/ jsxs(Fragment, {
        children: [
            gridRowsShown && /*#__PURE__*/ jsx(GridRows, {
                scale: temporaryScale,
                width: xMax,
                height: yMax,
                stroke: strokeColor,
                strokeDasharray: gridDashArray
            }),
            gridBordersShown && /*#__PURE__*/ jsx("line", {
                x1: xMax,
                x2: xMax,
                y1: 0,
                y2: yMax,
                stroke: strokeColor,
                strokeWidth: 1,
                strokeDasharray: gridDashArray
            }),
            gridColumnsShown && /*#__PURE__*/ jsx(GridColumns, {
                scale: xScale,
                width: xMax,
                height: yMax,
                stroke: strokeColor,
                strokeDasharray: gridDashArray
            }),
            /*#__PURE__*/ jsx(Bottom, {
                xScale: xScale,
                yMax: yMax,
                strokeDasharray: gridDashArray
            }),
            /*#__PURE__*/ jsx(AxisLeft, {
                scale: temporaryScale,
                orientation: Orientation.left,
                stroke: strokeColor,
                strokeWidth: gridBordersShown ? 1 : 0,
                strokeDasharray: gridDashArray,
                hideTicks: true,
                tickLabelProps: ()=>axisLeftTickLabelProps,
                tickFormat: temporaryScale.tickFormat(10, "~s"),
                tickValues: ticks.slice(1, -1)
            })
        ]
    });
});
const spring = {
    type: "tween",
    duration: 1,
    easings: [
        "anticipate"
    ]
};
function useCustomSpring(value) {
    const motionValue = useMotionValue(value);
    const [current, setCurrent] = useState(value);
    useLayoutEffect(()=>{
        return motionValue.onChange((value)=>setCurrent(value));
    }, [
        motionValue
    ]);
    useEffect(()=>{
        const controls = animate(motionValue, value, spring);
        return controls.stop;
    }, [
        motionValue,
        value
    ]);
    return current;
}

function ZoomBar({ controlsState , yMax  }) {
    if (controlsState.type !== "zoom") {
        return null;
    }
    const { start , end  } = controlsState;
    if (end === undefined) {
        return null;
    }
    const reverseZoom = end < start;
    return /*#__PURE__*/ jsx(Bar, {
        stroke: "#4797ff",
        strokeWidth: 1,
        fill: "#a3cbff",
        fillOpacity: "10%",
        x: reverseZoom ? end : start,
        y: 0,
        width: reverseZoom ? start - end : end - start,
        height: yMax
    });
}

function CoreChart({ chart , gridShown =true , onChangeTimeRange , readOnly =false , showTooltip , timeRange , ...props }) {
    const interactiveControlsState = useContext(InteractiveControlsStateContext);
    const [shiftKeyPressed, setShiftKeyPressed] = useState(false);
    const onKeyHandler = (event)=>{
        setShiftKeyPressed(event.shiftKey);
    };
    const { width , height , xMax , yMax , marginTop , marginLeft  } = useContext(ChartSizeContext);
    const { onMouseDown , onMouseUp , onMouseEnter , onMouseMove: onMouseMoveControls , graphContentRef  } = useMouseControls({
        onChangeTimeRange,
        timeRange,
        xMax,
        yMax
    });
    const { graphTooltip , onMouseMove: onMouseMoveTooltip , onMouseLeave  } = useTooltip();
    const onMouseMove = (event)=>{
        setShiftKeyPressed(event.shiftKey);
        onMouseMoveControls(event);
        onMouseMoveTooltip(event);
    };
    const clipPathId = useId();
    const cursor = getCursorFromState(interactiveControlsState, shiftKeyPressed);
    const scales = useScales(xMax, yMax);
    return /*#__PURE__*/ jsx(StyledContainer, {
        onKeyDown: onKeyHandler,
        onKeyUp: onKeyHandler,
        onMouseDown: onMouseDown,
        onMouseMove: onMouseMove,
        onMouseUp: onMouseUp,
        onMouseEnter: onMouseEnter,
        onMouseLeave: onMouseLeave,
        children: /*#__PURE__*/ jsxs("svg", {
            width: width,
            height: height,
            style: {
                cursor
            },
            children: [
                /*#__PURE__*/ jsx("defs", {
                    children: /*#__PURE__*/ jsx("clipPath", {
                        id: clipPathId,
                        children: /*#__PURE__*/ jsx("rect", {
                            x: 0,
                            y: 0,
                            width: xMax,
                            height: yMax
                        })
                    })
                }),
                /*#__PURE__*/ jsxs("g", {
                    transform: `translate(${marginLeft}, ${marginTop})`,
                    children: [
                        gridShown && /*#__PURE__*/ jsx(GridWithAxes, {
                            ...props,
                            scales: scales
                        }),
                        /*#__PURE__*/ jsx("g", {
                            clipPath: `url(#${clipPathId})`,
                            ref: graphContentRef,
                            children: /*#__PURE__*/ jsx(ChartContent, {
                                ...props,
                                chart: chart,
                                scales: scales
                            })
                        }),
                        /*#__PURE__*/ jsx(ZoomBar, {
                            controlsState: interactiveControlsState,
                            yMax: yMax
                        })
                    ]
                }),
                graphTooltip && /*#__PURE__*/ jsxs("g", {
                    children: [
                        /*#__PURE__*/ jsx(Line, {
                            from: {
                                x: graphTooltip.left,
                                y: 0
                            },
                            to: {
                                x: graphTooltip.left,
                                y: yMax
                            },
                            stroke: graphTooltip.color,
                            strokeWidth: 1,
                            pointerEvents: "none",
                            strokeDasharray: "1 1"
                        }),
                        /*#__PURE__*/ jsx("circle", {
                            cx: graphTooltip.left,
                            cy: graphTooltip.top,
                            r: 4,
                            fill: graphTooltip.color,
                            pointerEvents: "none"
                        })
                    ]
                })
            ]
        })
    });
}
const StyledContainer = styled(Container)`
  margin-top: 2px;
`;
function getCursorFromState(interactiveControlsState, shiftKey) {
    switch(interactiveControlsState.type){
        case "none":
            return shiftKey ? "grab" : "default";
        case "drag":
            return interactiveControlsState.start === null ? "grab" : "grabbing";
        case "zoom":
            return "zoom-in";
    }
}

const BAR_PADDING = 0.2;
const BAR_PLUS_PADDING = 1 + BAR_PADDING;
const HALF_PADDING = 0.5 * BAR_PADDING;
/**
 * Calculates the width of bars in bar charts.
 */ function calculateBarWidth(xAxis, interval, numBarsPerGroup) {
    const numGroups = interval === 0 ? 1 : Math.round((xAxis.maxValue - xAxis.minValue) / interval) + 1;
    const numBars = numGroups * numBarsPerGroup;
    return 1 / (numBars * BAR_PLUS_PADDING);
}
/**
 * Calculates the (left) X coordinate for a bar in a bar chart.
 *
 * `groupX` is the center coordinate for the bar group that contains all the
 * bars for a given bucket. `barWidth` is the width of an individual bar.
 *
 * `barIndex` and `numShapeLists` define the index of the bar within the group,
 * and how many bars may exist in the group in total, respectively.
 */ function calculateBarX(groupX, barWidth, barIndex, numShapeLists) {
    return groupX + (barIndex - 0.5 * numShapeLists) * (barWidth * BAR_PLUS_PADDING) - barWidth * HALF_PADDING;
}
/**
 * Wrapper around `createMetricBuckets()` and axes creation specialized for
 * usage with stacked charts.
 */ function calculateBucketsAndAxesForStackedChart(input) {
    const buckets = createMetricBuckets(input.timeseriesData, ({ currentY , total  }, value)=>({
            currentY,
            total: total + value
        }), {
        currentY: 0,
        total: 0
    });
    const isPercentage = input.stackingType === "percentage";
    const xAxis = getXAxisFromTimeRange(input.timeRange);
    const yAxis = isPercentage ? {
        minValue: 0,
        maxValue: 1
    } : calculateStackedYAxisRange(buckets, ({ total  })=>total);
    return {
        buckets,
        isPercentage,
        xAxis,
        yAxis
    };
}
/**
 * Calculates the smallest interval between any two timestamps present in the
 * given buckets.
 *
 * Returns `null` if there are insufficient timestamps to calculate an interval.
 */ function calculateSmallestTimeInterval(buckets) {
    const timestamps = Array.from(buckets.keys(), getTimeFromTimestamp);
    if (timestamps.length < 2) {
        return null;
    }
    timestamps.sort();
    let smallestInterval = Infinity;
    for(let i = 1; i < timestamps.length; i++){
        const interval = timestamps[i] - timestamps[i - 1];
        if (interval < smallestInterval) {
            smallestInterval = interval;
        }
    }
    return smallestInterval;
}
/**
 * Detects the range to display along the Y axis by looking at all the min-max
 * values inside the buckets.
 *
 * When rendering a stacked chart, use `calculateStackedYAxisRange()` instead.
 */ function calculateYAxisRange(buckets, getMinMax) {
    const minMax = getBucketsMinMax(buckets, getMinMax);
    if (!minMax) {
        return getYAxisForConstantValue(0);
    }
    const [minValue, maxValue] = minMax;
    return {
        minValue,
        maxValue
    };
}
/**
 * Detects the range to display along the Y axis by looking at all the totals
 * inside the buckets.
 *
 * This function is used for stacked charts. When rendering a normal chart, use
 * `calculateYAxisRange()` instead.
 */ function calculateStackedYAxisRange(buckets, getTotalValue) {
    if (buckets.size === 0) {
        return getYAxisForConstantValue(0);
    }
    const minMax = getInitialMinMax(0);
    for (const value of buckets.values()){
        extendMinMax(minMax, getTotalValue(value));
    }
    const [minValue, maxValue] = minMax;
    if (minValue === maxValue) {
        return getYAxisForConstantValue(minValue);
    }
    return {
        minValue,
        maxValue
    };
}
function createMetricBuckets(timeseriesData, reducer, initialValue) {
    const buckets = new Map();
    for (const timeseries of timeseriesData){
        if (!timeseries.visible) {
            continue;
        }
        for (const { time , value  } of timeseries.metrics){
            if (!Number.isNaN(value)) {
                buckets.set(time, reducer(buckets.get(time) ?? initialValue, value));
            }
        }
    }
    return buckets;
}
/**
 * Extends the range of an axis with the given interval.
 *
 * The range of the interval is divided among ends of the axis. The purpose of
 * this is to extend the axis with enough space to display the bars for the
 * first and last buckets displayed on the bar chart.
 *
 * @note This function mutates its input axis.
 */ function extendAxisWithInterval(axis, interval) {
    const halfInterval = 0.5 * interval;
    axis.minValue -= halfInterval;
    axis.maxValue += halfInterval;
    return axis;
}
/**
 * Extends the given min-max, if necessary, with the given value.
 *
 * @note This function mutates its input min-max.
 */ function extendMinMax(minMax, value) {
    if (value < minMax[0]) {
        minMax[0] = value;
    } else if (value > minMax[1]) {
        minMax[1] = value;
    }
    return minMax;
}
function getBucketsMinMax(buckets, getMinMax) {
    let minMax;
    for (const value of buckets.values()){
        const bucketMinMax = getMinMax(value);
        if (!minMax) {
            minMax = bucketMinMax;
            continue;
        }
        if (bucketMinMax[0] < minMax[0]) {
            minMax[0] = bucketMinMax[0];
        }
        if (bucketMinMax[1] > minMax[1]) {
            minMax[1] = bucketMinMax[1];
        }
    }
    return minMax;
}
/**
 * Returns the initial min-max based on a single value.
 */ function getInitialMinMax(value) {
    return [
        value,
        value
    ];
}
/**
 * Converts an RFC 3339-formatted timestamp to a time expressed in milliseconds.
 */ function getTimeFromTimestamp(timestamp) {
    const time = new Date(timestamp).getTime();
    if (Number.isNaN(time)) {
        throw new TypeError(`Invalid timestamp: ${timestamp}`);
    }
    return time;
}
/**
 * Returns the X axis to display results for the given time range.
 */ function getXAxisFromTimeRange(timeRange) {
    return {
        minValue: getTimeFromTimestamp(timeRange.from),
        maxValue: getTimeFromTimestamp(timeRange.to)
    };
}
/**
 * Returns the Y axis to display results if all results have the same value.
 *
 * For values larger than 1 or smaller than -1, the results will be centered
 * along the Y axis. For values closer to zero, the zero value is kept at the
 * bottom (for zero and positive values) or top (for negative values) of the
 * axis.
 */ function getYAxisForConstantValue(value) {
    if (value > 1 || value < -1) {
        return {
            minValue: value - 1,
            maxValue: value + 1
        };
    } else if (value >= 0) {
        return {
            minValue: 0,
            maxValue: value + 1
        };
    } else {
        return {
            minValue: value - 1,
            maxValue: 0
        };
    }
}
/**
 * Takes an absolute value and normalizes it to a value between 0.0 and 1.0 for
 * the given axis.
 */ function normalizeAlongLinearAxis(value, axis) {
    return (value - axis.minValue) / (axis.maxValue - axis.minValue);
}

function generateBarChartFromTimeseries(input) {
    const visibleTimeseriesData = input.timeseriesData.filter((timeseries)=>timeseries.visible);
    const buckets = createMetricBuckets(visibleTimeseriesData, (maybeMinMax, value)=>maybeMinMax ? extendMinMax(maybeMinMax, value) : getInitialMinMax(value));
    const xAxis = getXAxisFromTimeRange(input.timeRange);
    const yAxis = calculateYAxisRange(buckets, identity);
    const numShapeLists = visibleTimeseriesData.length;
    const interval = calculateSmallestTimeInterval(buckets);
    if (interval) {
        extendAxisWithInterval(xAxis, interval);
    }
    const barWidth = calculateBarWidth(xAxis, interval ?? 0, numShapeLists);
    const barArgs = {
        barWidth,
        numShapeLists,
        xAxis,
        yAxis
    };
    const shapeLists = input.timeseriesData.map((timeseries)=>({
            shapes: timeseries.visible ? compact(timeseries.metrics.map((metric)=>getBarShape$1(metric, visibleTimeseriesData.indexOf(timeseries), barArgs))) : [],
            source: timeseries
        }));
    return {
        shapeLists,
        xAxis,
        yAxis
    };
}
function getBarShape$1(metric, barIndex, { xAxis , yAxis , barWidth , numShapeLists: numVisibleTimeseries  }) {
    if (Number.isNaN(metric.value)) {
        return null;
    }
    const groupX = normalizeAlongLinearAxis(getTimeFromTimestamp(metric.time), xAxis);
    return {
        type: "rectangle",
        x: calculateBarX(groupX, barWidth, barIndex, numVisibleTimeseries),
        width: barWidth,
        y: 0,
        height: normalizeAlongLinearAxis(metric.value, yAxis),
        source: metric
    };
}

function generateLineChartFromTimeseries(input) {
    const buckets = createMetricBuckets(input.timeseriesData, (maybeMinMax, value)=>maybeMinMax ? extendMinMax(maybeMinMax, value) : getInitialMinMax(value));
    const xAxis = getXAxisFromTimeRange(input.timeRange);
    const yAxis = calculateYAxisRange(buckets, identity);
    const shapeLists = input.timeseriesData.map((timeseries)=>({
            shapes: timeseries.visible ? getShapes$1(timeseries.metrics, xAxis, yAxis) : [],
            source: timeseries
        }));
    return {
        shapeLists,
        xAxis,
        yAxis
    };
}
function getShapes$1(metrics, xAxis, yAxis) {
    switch(metrics.length){
        case 0:
            return [];
        case 1:
            {
                const metric = metrics[0];
                return Number.isNaN(metric.value) ? [] : [
                    {
                        type: "point",
                        ...getPointForMetric$1(metric, xAxis, yAxis)
                    }
                ];
            }
        default:
            // TODO: Implement gap detection: https://github.com/autometrics-dev/explorer/issues/35
            return [
                {
                    type: "line",
                    points: metrics.map((metric)=>getPointForMetric$1(metric, xAxis, yAxis))
                }
            ];
    }
}
function getPointForMetric$1(metric, xAxis, yAxis) {
    const time = getTimeFromTimestamp(metric.time);
    return {
        x: normalizeAlongLinearAxis(time, xAxis),
        y: normalizeAlongLinearAxis(metric.value, yAxis),
        source: metric
    };
}

function generateStackedBarChartFromTimeseries(input) {
    const { buckets , isPercentage , xAxis , yAxis  } = calculateBucketsAndAxesForStackedChart(input);
    const interval = calculateSmallestTimeInterval(buckets);
    if (interval) {
        extendAxisWithInterval(xAxis, interval);
    }
    const barWidth = calculateBarWidth(xAxis, interval ?? 0, 1);
    const barArgs = {
        barWidth,
        buckets,
        isPercentage,
        xAxis,
        yAxis
    };
    const shapeLists = input.timeseriesData.map((timeseries)=>({
            shapes: timeseries.visible ? compact(timeseries.metrics.map((metric)=>getBarShape(metric, barArgs))) : [],
            source: timeseries
        }));
    return {
        shapeLists,
        xAxis,
        yAxis
    };
}
function getBarShape(metric, { xAxis , yAxis , barWidth , isPercentage , buckets  }) {
    const bucketValue = buckets.get(metric.time);
    if (!bucketValue || Number.isNaN(metric.value)) {
        return null;
    }
    const time = getTimeFromTimestamp(metric.time);
    const value = isPercentage ? metric.value / bucketValue.total : metric.value;
    const x = normalizeAlongLinearAxis(time, xAxis) - 0.5 * barWidth;
    const y = bucketValue.currentY;
    const height = normalizeAlongLinearAxis(value, yAxis);
    bucketValue.currentY += height;
    return {
        type: "rectangle",
        x,
        y,
        width: barWidth,
        height,
        source: metric
    };
}

function generateStackedLineChartFromTimeseries(input) {
    const axesAndBuckets = calculateBucketsAndAxesForStackedChart(input);
    const shapeLists = input.timeseriesData.map((timeseries)=>({
            shapes: timeseries.visible ? getShapes(timeseries.metrics, axesAndBuckets) : [],
            source: timeseries
        }));
    return {
        shapeLists,
        xAxis: axesAndBuckets.xAxis,
        yAxis: axesAndBuckets.yAxis
    };
}
function getShapes(metrics, axesAndBuckets) {
    if (metrics.length === 0) {
        return [];
    }
    // TODO: Implement gap detection: https://github.com/autometrics-dev/explorer/issues/35
    const points = compact(metrics.map((metric)=>getPointForMetric(metric, axesAndBuckets)));
    return [
        {
            type: "area",
            points
        }
    ];
}
function getPointForMetric(metric, { buckets , isPercentage , xAxis , yAxis  }) {
    const bucketValue = buckets.get(metric.time);
    if (!bucketValue) {
        return null;
    }
    const time = getTimeFromTimestamp(metric.time);
    const value = isPercentage ? metric.value / bucketValue.total : metric.value;
    const yMin = bucketValue.currentY;
    const yMax = yMin + normalizeAlongLinearAxis(value, yAxis);
    bucketValue.currentY = yMax;
    return {
        x: normalizeAlongLinearAxis(time, xAxis),
        yMin,
        yMax,
        source: metric
    };
}

function generateFromTimeseries(input) {
    if (input.graphType === "line") {
        return input.stackingType === "none" ? generateLineChartFromTimeseries(input) : generateStackedLineChartFromTimeseries(input);
    } else {
        return input.stackingType === "none" ? generateBarChartFromTimeseries(input) : generateStackedBarChartFromTimeseries(input);
    }
}

function TimeseriesLegendItem({ color , onHover , onToggleTimeseriesVisibility , readOnly , index , setSize , timeseries , uniqueKeys  }) {
    const [ref, { height  }] = useMeasure();
    useEffect(()=>{
        if (height) {
            setSize(index, height);
        }
    }, [
        height,
        setSize,
        index
    ]);
    const toggleTimeseriesVisibility = onToggleTimeseriesVisibility && !readOnly ? (event)=>{
        preventDefault(event);
        const toggleSingle = isMac ? event.metaKey : event.ctrlKey;
        onToggleTimeseriesVisibility({
            timeseries,
            toggleOthers: !toggleSingle
        });
    } : noop;
    const onKeyDown = (event)=>{
        if (event.key === "Space") {
            toggleTimeseriesVisibility(event);
        }
    };
    return /*#__PURE__*/ jsx("div", {
        ref: ref,
        onClick: toggleTimeseriesVisibility,
        onKeyDown: onKeyDown,
        children: /*#__PURE__*/ jsxs(LegendItemContainer, {
            onMouseOver: timeseries.visible ? onHover : noop,
            interactive: !readOnly && onToggleTimeseriesVisibility !== undefined,
            children: [
                /*#__PURE__*/ jsx(ColorBlock, {
                    color: color,
                    selected: timeseries.visible,
                    children: timeseries.visible && /*#__PURE__*/ jsx(Icon, {
                        type: "check",
                        width: "12",
                        height: "12"
                    })
                }),
                /*#__PURE__*/ jsx(Text, {
                    children: /*#__PURE__*/ jsx(FormattedTimeseries, {
                        metric: timeseries,
                        sortLabels: true,
                        emphasizedKeys: uniqueKeys
                    })
                })
            ]
        })
    });
}
const ColorBlock = styled.div`
    background: ${({ color , selected  })=>selected ? color : "transparent"};
    border: 2px solid ${({ color  })=>color};
    width: 14px;
    height: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${({ theme  })=>theme.colorBackground};
    border-radius: ${({ theme  })=>theme.borderRadius400};
`;
const InteractiveItemStyling = css`
    cursor: pointer;

    &:hover {
        background: ${({ theme  })=>theme.colorPrimaryAlpha100};
    }
`;
const LegendItemContainer = styled(Container)`
    border-radius: ${({ theme  })=>theme.borderRadius500};
    display: flex;
    align-items: center;
    font: ${({ theme  })=>theme.fontAxisShortHand};
    padding: 8px 8px 8px 14px;
    gap: 10px;
    word-wrap: anywhere;

    ${({ interactive  })=>interactive && InteractiveItemStyling}
`;
const Text = styled.div`
    flex: 1;
`;

const DEFAULT_HEIGHT = 293;
const DEFAULT_SIZE = 50;
const EXPANDED_HEIGHT = 592;
const TimeseriesLegend = /*#__PURE__*/ memo(function TimeseriesLegend({ chart , colors , footerShown =true , onFocusedShapeListChange , onToggleTimeseriesVisibility , readOnly =false  }) {
    const { expandButton , gradient , isExpanded , onScroll , ref  } = useExpandable({
        defaultHeight: DEFAULT_HEIGHT
    });
    const maxHeight = isExpanded ? EXPANDED_HEIGHT : DEFAULT_HEIGHT;
    const timeseriesData = useMemo(()=>chart.shapeLists.map((shapeList)=>shapeList.source), [
        chart
    ]);
    const numSeries = timeseriesData.length;
    const resultsText = `${numSeries} result${numSeries === 1 ? "" : "s"}`;
    const uniqueKeys = useMemo(()=>findUniqueKeys(timeseriesData), [
        timeseriesData
    ]);
    const listRef = useRef(null);
    const sizeMap = useRef(new Map());
    const heightRef = useRef(timeseriesData.length * DEFAULT_SIZE);
    const update = useForceUpdate();
    useEffect(()=>{
        sizeMap.current = new Map();
        heightRef.current = timeseriesData.length * DEFAULT_SIZE;
        update();
    }, [
        timeseriesData,
        update
    ]);
    const getSize = (index)=>sizeMap.current.get(index) ?? DEFAULT_SIZE;
    const setSize = useHandler((index, size)=>{
        const oldSize = getSize(index);
        sizeMap.current.set(index, size);
        listRef.current?.resetAfterIndex(index);
        heightRef.current += size - oldSize;
        if (heightRef.current < maxHeight) {
            update();
        }
    });
    const onMouseOut = ()=>onFocusedShapeListChange?.(null);
    const setFocusedTimeseries = onFocusedShapeListChange ? (timeseries)=>{
        const shapeList = chart.shapeLists.find((shapeList)=>shapeList.source === timeseries);
        if (shapeList) {
            onFocusedShapeListChange(shapeList);
        }
    } : noop;
    const render = useHandler(({ data , index , style  })=>{
        const timeseries = data[index];
        return /*#__PURE__*/ jsx("div", {
            style: style,
            children: timeseries && /*#__PURE__*/ jsx(TimeseriesLegendItem, {
                color: getShapeListColor(colors, index),
                onHover: ()=>setFocusedTimeseries(timeseries),
                onToggleTimeseriesVisibility: onToggleTimeseriesVisibility,
                readOnly: readOnly,
                timeseries: timeseries,
                uniqueKeys: uniqueKeys,
                index: index,
                setSize: setSize
            })
        });
    });
    return /*#__PURE__*/ jsxs(ChartLegendContainer, {
        onMouseOut: onMouseOut,
        ref: ref,
        children: [
            /*#__PURE__*/ jsxs(ExpandableContainer, {
                maxHeight: `${maxHeight}px`,
                onScroll: onScroll,
                children: [
                    /*#__PURE__*/ jsx(VariableSizeList, {
                        height: Math.min(heightRef.current, maxHeight),
                        width: "100%",
                        ref: listRef,
                        itemCount: timeseriesData.length,
                        itemData: timeseriesData,
                        itemSize: getSize,
                        children: render
                    }),
                    gradient
                ]
            }),
            footerShown && /*#__PURE__*/ jsxs(Footer, {
                children: [
                    /*#__PURE__*/ jsx(Results, {
                        children: resultsText
                    }),
                    expandButton
                ]
            })
        ]
    });
});
const ExpandableContainer = styled.div`
    max-height: ${({ maxHeight  })=>maxHeight};
    overflow: auto;
`;
const Footer = styled.div`
    width: 100%;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: space-between;
`;
const ChartLegendContainer = styled(Container)`
    flex-direction: column;
    font: ${({ theme  })=>theme.fontLegendShortHand};
    letter-spacing: ${({ theme  })=>theme.fontLegendLetterSpacing};
    letter-spacing: 0.02em;
    padding: 10px 0 0;
    position: relative;
    word-wrap: break-word;
`;
const Results = styled.span`
    font: ${({ theme  })=>theme.fontResultsSummaryShortHand};
    letter-spacing: ${({ theme  })=>theme.fontResultsSummaryLetterSpacing};
    color: ${({ theme  })=>theme.colorBase400};
`;

function MetricsChart(props) {
    return props.readOnly ? /*#__PURE__*/ jsx(ReadOnlyMetricsChart, {
        ...props
    }) : /*#__PURE__*/ jsx(InteractiveMetricsChart, {
        ...props
    });
}
function InteractiveMetricsChart(props) {
    const coreControls = useCoreControls(props);
    const { interactiveControls , interactiveControlsState  } = useInteractiveControls();
    return /*#__PURE__*/ jsx(CoreControlsContext.Provider, {
        value: coreControls,
        children: /*#__PURE__*/ jsx(InteractiveControlsApiContext.Provider, {
            value: interactiveControls,
            children: /*#__PURE__*/ jsx(InteractiveControlsStateContext.Provider, {
                value: interactiveControlsState,
                children: /*#__PURE__*/ jsx(StyledChartSizeContainerProvider$1, {
                    overrideHeight: HEIGHT,
                    marginTop: MARGINS.top,
                    marginRight: MARGINS.right,
                    marginBottom: MARGINS.bottom,
                    marginLeft: MARGINS.left,
                    children: /*#__PURE__*/ jsx(InnerMetricsChart, {
                        ...props
                    })
                })
            })
        })
    });
}
function ReadOnlyMetricsChart(props) {
    return /*#__PURE__*/ jsx(ChartSizeContainerProvider, {
        overrideHeight: HEIGHT,
        marginTop: MARGINS.top,
        marginRight: MARGINS.right,
        marginBottom: MARGINS.bottom,
        marginLeft: MARGINS.left,
        children: /*#__PURE__*/ jsx(InnerMetricsChart, {
            ...props
        })
    });
}
const InnerMetricsChart = /*#__PURE__*/ memo(function InnerMetricsChart(props) {
    const { chartControlsShown =true , colors , graphType , legendShown =true , readOnly , stackingControlsShown =true , stackingType , timeRange , timeseriesData  } = props;
    const chart = useMemo(()=>generateFromTimeseries({
            graphType,
            stackingType,
            timeRange,
            timeseriesData
        }), [
        graphType,
        stackingType,
        timeRange,
        timeseriesData
    ]);
    const [focusedShapeList, setFocusedShapeList] = useState(null);
    const theme = useTheme();
    const chartColors = useMemo(()=>colors || [
            theme["colorSupport1400"],
            theme["colorSupport2400"],
            theme["colorSupport3400"],
            theme["colorSupport4400"],
            theme["colorSupport5400"],
            theme["colorSupport6400"],
            theme["colorSupport7400"],
            theme["colorSupport8400"],
            theme["colorSupport9400"],
            theme["colorSupport10400"],
            theme["colorSupport11400"]
        ], [
        theme,
        colors
    ]);
    return /*#__PURE__*/ jsxs(Fragment, {
        children: [
            chartControlsShown && !readOnly && /*#__PURE__*/ jsx(ChartControls, {
                ...props,
                stackingControlsShown: stackingControlsShown
            }),
            /*#__PURE__*/ jsx(CoreChart, {
                ...props,
                chart: chart,
                colors: chartColors,
                focusedShapeList: focusedShapeList,
                onFocusedShapeListChange: setFocusedShapeList
            }),
            legendShown && /*#__PURE__*/ jsx(TimeseriesLegend, {
                ...props,
                chart: chart,
                colors: chartColors,
                onFocusedShapeListChange: setFocusedShapeList
            })
        ]
    });
});
const StyledChartSizeContainerProvider$1 = styled(ChartSizeContainerProvider)`
  display: flex;
  gap: 12px;
  flex-direction: column;
`;

function SparkChart({ colors , graphType , stackingType , timeRange , timeseriesData , onChangeTimeRange  }) {
    const theme = useTheme();
    const chart = useMemo(()=>generateFromTimeseries({
            graphType,
            stackingType,
            timeRange,
            timeseriesData
        }), [
        graphType,
        stackingType,
        timeRange,
        timeseriesData
    ]);
    const chartColors = useMemo(()=>colors || [
            theme["colorSupport1400"],
            theme["colorSupport2400"],
            theme["colorSupport3400"],
            theme["colorSupport4400"],
            theme["colorSupport5400"],
            theme["colorSupport6400"],
            theme["colorSupport7400"],
            theme["colorSupport8400"],
            theme["colorSupport9400"],
            theme["colorSupport10400"],
            theme["colorSupport11400"]
        ], [
        theme,
        colors
    ]);
    return /*#__PURE__*/ jsx(StyledChartSizeContainerProvider, {
        children: /*#__PURE__*/ jsx(CoreChart, {
            chart: chart,
            colors: chartColors,
            focusedShapeList: null,
            gridShown: false,
            onChangeTimeRange: onChangeTimeRange,
            timeRange: timeRange
        })
    });
}
const StyledChartSizeContainerProvider = styled(ChartSizeContainerProvider)`
  width: 100%;
  height: 100%;
`;

export { MetricsChart, SparkChart };
//# sourceMappingURL=index.js.map
