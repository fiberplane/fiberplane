import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import * as React from 'react';
import { forwardRef, memo, Fragment as Fragment$1, createContext, useRef, useCallback, useMemo, useState, useEffect, useReducer, useLayoutEffect, useContext } from 'react';
import styled, { css, useTheme } from 'styled-components';
import { localPoint } from '@visx/event';
import { getTicks, scaleUtc, scaleBand, scaleLinear } from '@visx/scale';
import { utcFormat } from 'd3-time-format';
import { debounce } from 'throttle-debounce';
import { VariableSizeList } from 'react-window';
import { Group } from '@visx/group';
import { AreaStack, Bar, Area, Line as Line$1 } from '@visx/shape';
import { LinearGradient } from '@visx/gradient';
import { Threshold } from '@visx/threshold';
import { AxisBottom, AxisLeft, Orientation } from '@visx/axis';
import { GridRows, GridColumns } from '@visx/grid';
import { useMotionValue, animate } from 'framer-motion';

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

// Dimensions.
const HEIGHT = 275;
const MARGINS = {
    top: 0,
    bottom: 20,
    left: 38,
    right: 0
};

function toClosestPointArgs(args) {
    const { event , xScale , yScale , EPS =20  } = args;
    const { x: x0 , y: y0  } = localPoint(event) || {
        x: 0,
        y: 0
    };
    const xRange = getBoundary({
        value: x0 - MARGINS.left,
        // Decrease the EPS value slightly
        EPS,
        scale: xScale
    });
    const yRange = getBoundary({
        value: y0 - MARGINS.top,
        EPS,
        scale: yScale
    });
    return {
        xRange,
        yRange
    };
}
function getBoundary({ value , EPS , scale  }) {
    const low = scale.invert(value - EPS).valueOf();
    const high = scale.invert(value + EPS).valueOf();
    return {
        value: scale.invert(value).valueOf(),
        low: Math.min(low, high),
        high: Math.max(low, high)
    };
}
function insideRange(value, range) {
    return range.low < value && value < range.high;
}

/**
 * Strips all falsy values from an array.
 */ function compact(items) {
    return items.filter(Boolean);
}

const dateKey = Symbol("date");
function getTimestamp(d) {
    return new Date(d[dateKey]).getTime();
}
function dataToPercentages(dataItems) {
    return dataItems.map((item)=>{
        let total = 0;
        for (const value of item.data.values()){
            total += value;
        }
        if (total === 0) {
            return item;
        }
        const data = new Map();
        for (const [key, value] of item.data){
            data.set(key, value / total * 100);
        }
        return {
            [dateKey]: item[dateKey],
            data
        };
    });
}
function toDataItems(timeseriesData) {
    const timestampSet = new Set();
    const annotatedFilteredDataIn = compact(timeseriesData.map((series)=>{
        if (!series.visible) {
            return null;
        }
        // Make it easy to look up points by timestamp when assembling result:
        const data = {};
        for (const metric of series.metrics){
            data[metric.time] = metric.value;
            timestampSet.add(metric.time);
        }
        return [
            series,
            data
        ];
    }));
    return [
        ...timestampSet
    ].sort().map((timestamp)=>{
        const data = new Map();
        for (const [series, record] of annotatedFilteredDataIn){
            data.set(series, record[timestamp] ?? 0);
        }
        return {
            [dateKey]: timestamp,
            data
        };
    });
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

/**
 * Format metric to string. This is used to generate human readable strings
 *
 * Sorting of the labels is optional, but in the UI can be handy to more quickly find
 * a specific label in the text
 */ function formatTimeseries(timeseries, { sortLabels =true  } = {}) {
    const { name , labels  } = timeseries;
    let entries = Object.entries(labels);
    entries = sortLabels ? sortBy(entries, ([key])=>key) : entries;
    return `${name}{${entries.map(([k, v])=>`"${k}":"${v}"`).join(", ")}}`;
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
    }
    // must be days
    return utcFormat("%a %d");
}
function getTimeFormatter(scale) {
    const ticks = getTicks(scale, 10);
    if (ticks.length === 0) {
        return (item)=>item.toString();
    }
    const first = ticks[0];
    const second = ticks[1];
    const timeScale = first !== undefined && second !== undefined ? getTimeScale$1(first, second) : "hours";
    const formatter = getFormatter(timeScale);
    return (item)=>{
        const value = item instanceof Date ? item : new Date(item.valueOf());
        return formatter(value);
    };
}
function getTimeScale$1(time1, time2) {
    const delta = time2 - time1;
    if (delta < 1000) {
        return "milliseconds";
    }
    if (delta < 60 * 1000) {
        return "seconds";
    }
    if (delta < 60 * 60 * 1000) {
        return "minutes";
    }
    if (delta < 24 * 60 * 60 * 1000) {
        return "hours";
    }
    return "days";
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
    yMax: 0
});

/**
 * Context that handles the result of useCoreControls hooks
 */ const CoreControlsContext = createContext({
    zoom () {},
    move () {}
});

const FocusedTimeseriesApiContext = createContext({
    setFocusedTimeseries: noop
});

const FocusedTimeseriesStateContext = createContext({
    focusedTimeseries: null
});

/**
 * One of two parts of the useInteractiveControlState hook results
 *
 * This is the api/functional part
 */ const InteractiveControlsContext = createContext({
    reset () {},
    startDrag () {},
    startZoom () {},
    updateEndValue () {}
});

const defaultControlsState = {
    type: "none"
};
/**
 * Holds the interactive control state as returned by the useInteractiveControlState
 */ const InteractiveControlsStateContext = createContext(defaultControlsState);

const TooltipContext = createContext({
    showTooltip () {},
    hideTooltip () {}
});

const noDeps = [];
function useHandler(handler) {
    const handlerRef = useRef(handler);
    handlerRef.current = handler;
    // @ts-ignore
    return useCallback((...args)=>handlerRef.current(...args), noDeps);
}

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
    return useMemo(()=>({
            move,
            zoom
        }), [
        move,
        zoom
    ]);
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
/**
 * Returns zoom/drag handlers and state.
 */ function useInteractiveControls() {
    const [interactiveControlsState, dispatch] = useReducer(controlsStateReducer, defaultControlsState);
    const reset = useHandler(()=>{
        dispatch({
            type: "RESET"
        });
    });
    const startZoom = useHandler((start)=>{
        dispatch({
            type: "ZOOM_START",
            payload: {
                start
            }
        });
    });
    const startDrag = useHandler((start)=>{
        dispatch({
            type: "DRAG_START",
            payload: {
                start
            }
        });
    });
    const updateEndValue = useHandler((end)=>{
        dispatch({
            type: "UPDATE_END_VALUE",
            payload: {
                end
            }
        });
    });
    const interactiveControls = useMemo(()=>({
            reset,
            startDrag,
            startZoom,
            updateEndValue
        }), [
        reset,
        startDrag,
        startZoom,
        updateEndValue
    ]);
    return {
        interactiveControls,
        interactiveControlsState
    };
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
        options?.root,
        options?.rootMargin,
        options?.threshold
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
        element
    ]);
    return [
        setElement,
        rect
    ];
}

function zoomKeyPressed(event) {
    return isMac ? event.metaKey : event.ctrlKey;
}
/**
 * Hook for setting up mouse handlers to control dragging & zoom
 */ function useMouseControls({ timeRange , onChangeTimeRange  }) {
    const { move , zoom  } = useContext(CoreControlsContext);
    const { startDrag , startZoom , reset , updateEndValue  } = useContext(InteractiveControlsContext);
    const controlsState = useContext(InteractiveControlsStateContext);
    const { xMax , yMax  } = useContext(ChartSizeContext);
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

const getTime = (timestamp)=>new Date(timestamp).getTime();
const x$1 = (metric)=>getTime(metric.time);
const y$1 = (metric)=>metric.value;
function getTimeScale(timeRange, xMax) {
    return scaleUtc({
        range: [
            0,
            xMax
        ],
        domain: [
            new Date(timeRange.from).getTime(),
            new Date(timeRange.to).getTime()
        ]
    });
}
/**
 * In short: get two scales. This is used for bar charts (no `stackingType`),
 * where there's an `xScale` chart which contains the timeseries and a
 * `groupScale` for each of the metrics for each timestamp.
 */ function getGroupedScales(timeseriesData, controlsState, xMax) {
    const formattedVisibleTimeseries = timeseriesData.filter((series)=>series.visible).map((series)=>formatTimeseries(series));
    const timestampSet = new Set();
    for (const item of timeseriesData){
        for (const metric of item.metrics){
            timestampSet.add(metric.time);
        }
    }
    const timestamps = [
        ...timestampSet
    ].map(getTime).sort((a, b)=>a - b);
    const delta = controlsState.type === "drag" && typeof controlsState.end === "number" ? controlsState.end - controlsState.start : 0;
    const xScale = scaleBand({
        range: [
            0 + delta,
            xMax + delta
        ],
        domain: timestamps,
        padding: 0.2
    });
    const groupScale = scaleBand({
        range: [
            0,
            xScale.bandwidth()
        ],
        domain: formattedVisibleTimeseries,
        padding: 0.2
    });
    return {
        xScale,
        groupScale
    };
}
function getValueScale({ timeseriesData , yMax , stackingType ="none"  }) {
    const { min , max  } = getMinMax(timeseriesData, stackingType);
    const delta = max - min;
    return scaleLinear({
        range: [
            yMax,
            0
        ],
        round: false,
        nice: false,
        domain: [
            // only use min when stackingType is default, otherwise use 0
            // stacked graphs can otherwise overlap the axis text
            stackingType === "none" && min ? min : 0,
            stackingType === "percentage" ? max : max + delta * 0.05
        ]
    });
}
function getMinMax(timeseriesData, stackingType) {
    switch(stackingType){
        case "none":
            return getMinMaxDefault(timeseriesData);
        case "percentage":
            return {
                min: 0,
                max: 100
            };
        case "stacked":
            return getMinMaxStacked(timeseriesData);
    }
}
function getMinMaxDefault(timeseriesData) {
    const yValues = timeseriesData.filter((result)=>result.visible).flatMap((series)=>series.metrics.map(y$1));
    const min = yValues.length > 0 ? Math.min(...yValues) : 0;
    const max = yValues.length > 0 ? Math.max(...yValues) : 0;
    if (min === max) {
        // If all values are the same, we need to add/subtract a small offset
        // to/from min/max, otherwise the scale will be broken. But we should be
        // also careful not to drop the minimum below 0 if that's not necessary,
        // because it can give very odd results otherwise. The `-0.001` value
        // makes sure that we see at least a line with "0" values, or you might
        // not see whether there are any results at all.
        return {
            min: min < 0 || min >= 1 ? min - 1 : min - 0.001,
            max: max + 1
        };
    }
    return {
        min,
        max
    };
}
function getMinMaxStacked(timeseriesData) {
    const totals = new Map();
    for (const series of timeseriesData){
        if (!series.visible) {
            continue;
        }
        for (const metric of series.metrics){
            const time = getTime(metric.time);
            totals.set(time, (totals.get(time) ?? 0) + metric.value);
        }
    }
    return {
        min: Math.min(...totals.values()),
        max: Math.max(...totals.values())
    };
}

function useScales({ graphType , timeseriesData , stackingType , timeRange  }) {
    const { xMax , yMax  } = useContext(ChartSizeContext);
    const controlsState = useContext(InteractiveControlsStateContext);
    const xScaleProps = useMemo(()=>{
        if (graphType === "bar" && stackingType === "none") {
            return {
                graphType,
                stackingType,
                ...getGroupedScales(timeseriesData, controlsState, xMax)
            };
        }
        return {
            graphType,
            stackingType,
            xScale: getTimeScale(translateTimeRange(timeRange, controlsState, xMax), xMax)
        };
    }, [
        timeRange,
        xMax,
        controlsState,
        graphType,
        timeseriesData,
        stackingType
    ]);
    const yScale = useMemo(()=>getValueScale({
            timeseriesData,
            stackingType,
            yMax
        }), [
        timeseriesData,
        stackingType,
        yMax
    ]);
    return {
        xScaleProps,
        yScale
    };
}
/**
 * Translates a time-range based on the active zoom state.
 */ function translateTimeRange(timeRange, controlsState, xMax) {
    if (controlsState.type === "drag") {
        const { start , end  } = controlsState;
        if (end !== undefined && start !== end) {
            const from = timestampToSeconds(timeRange.from);
            const to = timestampToSeconds(timeRange.to);
            const delta = (start - end) / xMax * (to - from);
            return {
                from: secondsToTimestamp(from + delta),
                to: secondsToTimestamp(to + delta)
            };
        }
    }
    return timeRange;
}

function useTooltip(showTooltip) {
    const [graphTooltip, setGraphTooltip] = useState(null);
    const closeFnRef = useRef(null);
    return {
        graphTooltip,
        showTooltip: useHandler((tip)=>{
            if (!showTooltip) {
                return;
            }
            setGraphTooltip(tip);
            const element = {
                getBoundingClientRect: ()=>{
                    const ctm = tip.element.getScreenCTM();
                    const point = tip.element.createSVGPoint();
                    point.x = tip.left;
                    point.y = tip.top;
                    const { x =tip.left , y =tip.top  } = ctm === null ? {} : point.matrixTransform(ctm);
                    return new DOMRect(x - 4, y - 4, 8, 8);
                },
                contextElement: tip.element
            };
            closeFnRef.current = showTooltip(element, tip.metric);
        }),
        hideTooltip: useHandler(()=>{
            setGraphTooltip(null);
            if (closeFnRef.current) {
                closeFnRef.current();
                closeFnRef.current = null;
            }
        })
    };
}

const yMax = HEIGHT - MARGINS.top - MARGINS.bottom;
function ChartSizeContainerProvider({ children , className  }) {
    const [measureRef, { width , height  }] = useMeasure();
    const intersectionRef = useRef(null);
    const ref = mergeRefs([
        measureRef,
        intersectionRef
    ]);
    const intersections = useIntersectionObserver(intersectionRef, {
        root: null,
        rootMargin: "0px",
        threshold: 0
    });
    const [value, setValue] = useState(getValue(width));
    const heightRef = useRef(height || 700);
    const updateValue = useMemo(()=>debounce(100, (newWidth)=>setValue(getValue(newWidth))), []);
    useEffect(()=>{
        updateValue(width);
    }, [
        width,
        updateValue
    ]);
    if (height) {
        heightRef.current = height;
    }
    return /*#__PURE__*/ jsx("div", {
        ref: ref,
        className: className,
        children: intersections.some((intersection)=>intersection.isIntersecting) ? /*#__PURE__*/ jsx(ChartSizeContext.Provider, {
            value: value,
            children: children
        }) : /*#__PURE__*/ jsx(ChartSkeleton, {
            height: heightRef.current
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
function getXMax(width) {
    return width - MARGINS.left - MARGINS.right;
}
function getValue(width = 0) {
    return {
        width,
        height: HEIGHT,
        xMax: Math.max(0, getXMax(width)),
        yMax
    };
}

function FocusedTimeseriesContextProvider(props) {
    const { children  } = props;
    const [focusedTimeseries, setFocusedTimeseries] = useState(null);
    const value = useMemo(()=>({
            focusedTimeseries
        }), [
        focusedTimeseries
    ]);
    const apiValue = useMemo(()=>({
            setFocusedTimeseries
        }), [
        setFocusedTimeseries
    ]);
    return /*#__PURE__*/ jsx(FocusedTimeseriesApiContext.Provider, {
        value: apiValue,
        children: /*#__PURE__*/ jsx(FocusedTimeseriesStateContext.Provider, {
            value: value,
            children: children
        })
    });
}

const colors = [
    "colorSupport1400",
    "colorSupport2400",
    "colorSupport3400",
    "colorSupport4400",
    "colorSupport5400",
    "colorSupport6400",
    "colorSupport7400",
    "colorSupport8400",
    "colorSupport9400",
    "colorSupport10400",
    "colorSupport11400"
];
function getChartColor(i) {
    return colors[i % colors.length];
}

function ChartLegendItem({ color , onHover , onToggleTimeseriesVisibility , readOnly , index , setSize , timeseries , uniqueKeys  }) {
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
            readOnly: readOnly,
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

    ${({ readOnly  })=>readOnly === false && InteractiveItemStyling}
`;
const Text = styled.div`
    flex: 1;
`;

const DEFAULT_HEIGHT = 293;
const DEFAULT_SIZE = 50;
const EXPANDED_HEIGHT = 592;
const Legend = /*#__PURE__*/ memo(function Legend({ onToggleTimeseriesVisibility , readOnly =false , timeseriesData , footerShown =true  }) {
    const { expandButton , gradient , isExpanded , onScroll , ref  } = useExpandable({
        defaultHeight: DEFAULT_HEIGHT
    });
    const { setFocusedTimeseries  } = useContext(FocusedTimeseriesApiContext);
    const maxHeight = isExpanded ? EXPANDED_HEIGHT : DEFAULT_HEIGHT;
    const numSeries = timeseriesData.length;
    const resultsText = `${numSeries} result${numSeries === 1 ? "" : "s"}`;
    const uniqueKeys = useMemo(()=>findUniqueKeys(timeseriesData), [
        timeseriesData
    ]);
    const theme = useTheme();
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
    const onMouseOut = ()=>setFocusedTimeseries(null);
    const render = useHandler(({ data , index , style  })=>{
        const timeseries = data[index];
        return /*#__PURE__*/ jsx("div", {
            style: style,
            children: timeseries && /*#__PURE__*/ jsx(ChartLegendItem, {
                color: theme[getChartColor(index)],
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

const TimeseriesTableCaption = styled.caption`
  font-weight: bold;
  text-align: center;
  padding: 0 0 6px;
  color: ${({ theme  })=>theme.colorBase400};
`;
const TimeseriesTableTd = styled.td`
  word-wrap: anywhere;
`;

const getY0 = (d)=>d[0];
const getY1 = (d)=>d[1];
const Areas = /*#__PURE__*/ memo(function Areas({ timeseriesData , xScale , yScale , asPercentage =false  }) {
    const { xMax , yMax  } = useContext(ChartSizeContext);
    const { showTooltip , hideTooltip  } = useContext(TooltipContext);
    const theme = useTheme();
    const dataItems = useMemo(()=>{
        const dataItems = toDataItems(timeseriesData);
        return asPercentage ? dataToPercentages(dataItems) : dataItems;
    }, [
        timeseriesData,
        asPercentage
    ]);
    const timeseriesArray = dataItems[0] ? [
        ...dataItems[0].data.keys()
    ] : [];
    const keys = timeseriesArray.map((series)=>formatTimeseries(series));
    const handleTooltip = (event)=>{
        const args = toClosestPointArgs({
            event,
            xScale,
            yScale
        });
        const metric = closestMetric$2({
            dataItems,
            ...args
        });
        if (metric) {
            const left = xScale(new Date(metric.time)) + MARGINS.left;
            const top = yScale(metric.cumulativeValue) + MARGINS.top;
            const seriesIndex = timeseriesData.indexOf(metric.timeseries);
            const timeseries = timeseriesData[seriesIndex];
            const svg = event.currentTarget.ownerSVGElement;
            if (svg) {
                showTooltip({
                    colorName: getChartColor(seriesIndex),
                    metric: formatTimeseriesTooltip$2(timeseries, metric, asPercentage),
                    element: svg,
                    left,
                    top
                });
            }
        } else {
            hideTooltip();
        }
    };
    const { focusedTimeseries  } = useContext(FocusedTimeseriesStateContext);
    const focusedKey = focusedTimeseries && formatTimeseries(focusedTimeseries);
    return /*#__PURE__*/ jsxs(Fragment, {
        children: [
            /*#__PURE__*/ jsx(AreaStack, {
                keys: keys,
                data: dataItems,
                x: (d)=>xScale(getTimestamp(d.data)) ?? 0,
                value: (d, key)=>{
                    const index = keys.indexOf(key);
                    const metric = timeseriesArray[index];
                    return metric && d.data.get(metric) || 0;
                },
                y0: (d)=>yScale(getY0(d)) ?? 0,
                y1: (d)=>yScale(getY1(d)) ?? 0,
                children: ({ stacks , path  })=>stacks.map((series, index)=>{
                        const realIndex = timeseriesData.findIndex((item)=>formatTimeseries(item) === series.key);
                        const timeseries = timeseriesData[realIndex];
                        const color = theme[getChartColor(realIndex)];
                        return /*#__PURE__*/ jsxs(Group, {
                            opacity: focusedKey === null || focusedKey === series.key ? 1 : 0.2,
                            children: [
                                /*#__PURE__*/ jsx(LinearGradient, {
                                    id: `line-${index}`,
                                    from: color,
                                    to: color,
                                    fromOpacity: 0.15,
                                    toOpacity: 0.03,
                                    toOffset: "80%"
                                }),
                                /*#__PURE__*/ jsx("path", {
                                    id: series.key,
                                    d: path(series) || "",
                                    stroke: color,
                                    fill: `url(#line-${index})`
                                }, `stack-${series.key}`)
                            ]
                        }, formatTimeseries(timeseries, {
                            sortLabels: false
                        }));
                    }).reverse()
            }),
            /*#__PURE__*/ jsx(Bar, {
                width: xMax,
                height: yMax,
                fill: "transparent",
                onMouseMove: handleTooltip,
                onMouseLeave: hideTooltip
            })
        ]
    });
});
function closestMetric$2({ dataItems , xRange , yRange  }) {
    let metric = null;
    let minLen = Number.MAX_SAFE_INTEGER;
    for (const item of dataItems){
        const x = getTimestamp(item);
        if (!insideRange(x, xRange)) {
            continue;
        }
        let y = 0;
        const candidates = [];
        for (const [timeseries, value] of item.data.entries()){
            y += value;
            if (insideRange(y, yRange)) {
                candidates.push({
                    cumulativeValue: y,
                    timeseries
                });
            }
        }
        if (candidates.length > 0) {
            const xLen = Math.pow(xRange.value - x, 2);
            for (const { cumulativeValue , timeseries  } of candidates){
                const yLen = Math.pow(yRange.value - cumulativeValue, 2);
                const len = xLen + yLen;
                const value = item.data.get(timeseries);
                if (len < minLen && value !== undefined) {
                    minLen = len;
                    metric = {
                        cumulativeValue,
                        time: new Date(x).toISOString(),
                        timeseries,
                        value
                    };
                }
            }
        }
    }
    return metric;
}
function formatTimeseriesTooltip$2(timeseries, metric, asPercentage = false) {
    const labelEntries = Object.entries(timeseries.labels);
    return /*#__PURE__*/ jsxs("table", {
        children: [
            /*#__PURE__*/ jsx(TimeseriesTableCaption, {
                children: metric.time
            }),
            /*#__PURE__*/ jsx("thead", {
                children: /*#__PURE__*/ jsxs("tr", {
                    children: [
                        /*#__PURE__*/ jsx("th", {
                            children: timeseries.name || "value"
                        }),
                        /*#__PURE__*/ jsx("th", {
                            children: asPercentage ? `${metric.value.toLocaleString("en-US", {
                                maximumFractionDigits: 2,
                                minimumFractionDigits: 2,
                                useGrouping: false
                            })}%` : metric.value
                        })
                    ]
                })
            }),
            /*#__PURE__*/ jsx("tbody", {
                children: labelEntries.map(([key, value])=>/*#__PURE__*/ jsxs("tr", {
                        children: [
                            /*#__PURE__*/ jsxs(TimeseriesTableTd, {
                                children: [
                                    key,
                                    ":"
                                ]
                            }),
                            /*#__PURE__*/ jsx(TimeseriesTableTd, {
                                children: value
                            })
                        ]
                    }, key))
            })
        ]
    });
}

// This is the space that's always there even if the padding is set to 0.
const FIXED_PADDING = 7;
// Minimum width for a bar
const MIN_BAR_WIDTH = 3;
function calculateBandwidth(width, steps) {
    return Math.max((width - FIXED_PADDING * (steps - 1)) / steps, MIN_BAR_WIDTH);
}

/**
 * Hook managing tooltips/mouseevents for BarStacked component
 */ function useTooltips$1(params) {
    const { dataItems , xScale , yScale , timeseriesData , asPercentage  } = params;
    const { xMax  } = useContext(ChartSizeContext);
    const { showTooltip , hideTooltip  } = useContext(TooltipContext);
    const onMouseMove = (event)=>{
        const args = toClosestPointArgs({
            event,
            xScale,
            yScale,
            EPS: 40
        });
        const metric = closestMetric$1({
            dataItems,
            ...args
        });
        if (metric === null) {
            hideTooltip();
            return;
        }
        const svg = event.currentTarget.ownerSVGElement;
        if (svg) {
            const bandwidth = calculateBandwidth(xMax, dataItems.length);
            const { cumulativeValue , time , timeseries  } = metric;
            const seriesIndex = timeseriesData.indexOf(timeseries);
            showTooltip({
                top: yScale(cumulativeValue) + MARGINS.top,
                left: xScale(new Date(time)) + MARGINS.left + 0.5 * bandwidth,
                colorName: getChartColor(seriesIndex),
                element: svg,
                metric: formatMetricTooltip(timeseries, metric, asPercentage)
            });
        }
    };
    return {
        onMouseMove,
        onMouseLeave: hideTooltip
    };
}
function closestMetric$1({ dataItems , xRange , yRange  }) {
    let metric = null;
    let minLen = Number.MAX_SAFE_INTEGER;
    for (const item of dataItems){
        const x = getTimestamp(item);
        if (!insideRange(x, xRange)) {
            continue;
        }
        let y = 0;
        const candidates = [];
        for (const [metric, value] of item.data.entries()){
            y += value;
            if (insideRange(y, yRange)) {
                candidates.push({
                    timeseries: metric,
                    cumulativeValue: y
                });
            }
        }
        if (candidates.length > 0) {
            const xLen = Math.pow(xRange.value - x, 2);
            for (const { timeseries , cumulativeValue  } of candidates){
                const value = item.data.get(timeseries);
                const yLen = Math.pow(yRange.value - cumulativeValue, 2);
                const len = xLen + yLen;
                if (len < minLen && value !== undefined) {
                    minLen = len;
                    metric = {
                        cumulativeValue,
                        time: new Date(x).toISOString(),
                        timeseries,
                        value
                    };
                }
            }
        }
    }
    return metric;
}
function formatMetricTooltip(timeseries, metric, asPercentage = false) {
    const labelEntries = Object.entries(timeseries.labels);
    return /*#__PURE__*/ jsxs("table", {
        children: [
            /*#__PURE__*/ jsx(TimeseriesTableCaption, {
                children: metric.time
            }),
            /*#__PURE__*/ jsx("thead", {
                children: /*#__PURE__*/ jsxs("tr", {
                    children: [
                        /*#__PURE__*/ jsx("th", {
                            children: timeseries.name || "value"
                        }),
                        /*#__PURE__*/ jsx("th", {
                            children: asPercentage ? `${metric.value.toLocaleString("en-US", {
                                maximumFractionDigits: 2,
                                minimumFractionDigits: 2,
                                useGrouping: false
                            })}%` : metric.value
                        })
                    ]
                })
            }),
            /*#__PURE__*/ jsx("tbody", {
                children: labelEntries.map(([key, value])=>/*#__PURE__*/ jsxs("tr", {
                        children: [
                            /*#__PURE__*/ jsxs(TimeseriesTableTd, {
                                children: [
                                    key,
                                    ": "
                                ]
                            }),
                            /*#__PURE__*/ jsx(TimeseriesTableTd, {
                                children: value
                            })
                        ]
                    }, key))
            })
        ]
    });
}

const BarsStacked = /*#__PURE__*/ memo(function BarsStacked(props) {
    const { timeseriesData , xScale , yScale , asPercentage =false  } = props;
    const { xMax , yMax  } = useContext(ChartSizeContext);
    const theme = useTheme();
    const dataItems = useMemo(()=>{
        const dataItems = toDataItems(timeseriesData);
        return asPercentage ? dataToPercentages(dataItems) : dataItems;
    }, [
        timeseriesData,
        asPercentage
    ]);
    const { onMouseMove , onMouseLeave  } = useTooltips$1({
        dataItems,
        timeseriesData,
        xScale,
        yScale,
        asPercentage
    });
    const bandwidth = calculateBandwidth(xMax, dataItems.length);
    const { focusedTimeseries  } = useContext(FocusedTimeseriesStateContext);
    return /*#__PURE__*/ jsxs(Fragment, {
        children: [
            dataItems.map((item)=>{
                let offsetY = 0;
                const timestamp = item[dateKey];
                const x = xScale(getTimestamp(item)) ?? 0;
                const bars = [];
                for (const [timeseries, value] of item.data.entries()){
                    const realIndex = timeseriesData.indexOf(timeseries);
                    const yValue = value;
                    const originalY = yValue === undefined ? 0 : yScale(yValue);
                    const height = yMax - originalY;
                    const translatedY = originalY - offsetY;
                    offsetY += height;
                    const color = theme[getChartColor(realIndex)];
                    bars.push(/*#__PURE__*/ jsx(LinearGradient, {
                        id: `fill-${timestamp}-line-${realIndex}`,
                        from: color,
                        to: color,
                        fromOpacity: 0.15,
                        toOpacity: 0.03
                    }, `fill-${timestamp}-line-${realIndex}-gradient`), /*#__PURE__*/ jsx(Bar, {
                        id: `stack-${timestamp}-${realIndex}`,
                        x: x,
                        y: translatedY,
                        height: height,
                        width: bandwidth,
                        stroke: color,
                        fill: `url(#fill-${timestamp}-line-${realIndex})`,
                        opacity: focusedTimeseries === null || focusedTimeseries === timeseries ? 1 : 0.2
                    }, `stack-${timestamp}-${realIndex}`));
                }
                return bars;
            }),
            /*#__PURE__*/ jsx(Bar, {
                width: xMax,
                height: yMax,
                fill: "transparent",
                onMouseMove: onMouseMove,
                onMouseLeave: onMouseLeave
            })
        ]
    });
});

/**
 * Returns the relative value inside a band.
 *
 * Use case: get the X value as it is inside a specific band (useful when you
 * have scales inside scales)
 */ function getValueInsideScale(value, scale) {
    // Calculate the max width
    const maxScale = scale.step() * scale.domain().length;
    // clamp the value to this range
    const clamped = clamp(value - scale.paddingOuter() * scale.step(), 0, maxScale);
    // Get the value for inside the groupScale
    return clamped % scale.step();
}
function clamp(min, value, max) {
    return Math.min(Math.max(value, min), max);
}
function getCandidate({ x , xScale , y , yScale , timeseriesData , activeTimestamp  }) {
    const possibleTimeseries = timeseriesData.filter((series)=>series.visible);
    const yRange = getBoundary({
        value: y,
        EPS: 80,
        scale: yScale
    });
    const candidates = compact(possibleTimeseries.map((timeseries)=>{
        // Find the index for looking up the metric in the results
        const timeseriesIndex = xScale.domain().indexOf(formatTimeseries(timeseries));
        const series = timeseriesData[timeseriesIndex];
        const metric = series?.metrics.find((item)=>item.time === activeTimestamp);
        // Check if there's no metric or it's outside of the range.
        if (!metric || !insideRange(metric.value, yRange)) {
            return null;
        }
        return {
            timeseries,
            timeseriesIndex,
            metric
        };
    }));
    let minLen = Number.MAX_SAFE_INTEGER;
    let closest = null;
    for (const candidate of candidates){
        const candidateX = xScale(formatTimeseries(candidate.timeseries))?.valueOf();
        if (candidateX === undefined) {
            continue;
        }
        const xLen = Math.pow(x - candidateX, 2);
        const yLen = Math.pow(y - yScale(candidate.metric.value).valueOf(), 2);
        const len = xLen + yLen;
        if (len < minLen) {
            minLen = len;
            closest = candidate;
        }
    }
    return closest;
}
/**
 * BandScales don't have an invert function
 *
 * This function re-implements the logic and takes paddingOuter/inner into
 * consideration so we can do more than just set a single padding value
 */ function invert(scale, value) {
    const [lower, upper] = scale.range();
    const start = Math.min(lower, upper);
    const end = Math.max(lower, upper);
    const domain = scale.domain();
    const paddingOuter = scale.paddingOuter();
    const paddingInner = scale.paddingInner();
    /**
     * The range isn't divided into equal sections, padding outer offsets
     * the pattern as well as the paddingInner is used n(items) - 1 times
     */ const calculatedItems = domain.length + 2 * paddingOuter - paddingInner;
    const itemWidth = (end - start) / calculatedItems;
    const beginOffset = (0.5 * paddingInner - paddingOuter) * itemWidth;
    const offsetX = value + beginOffset;
    const closestIndex = Math.floor(offsetX / itemWidth);
    return domain[clamp(0, closestIndex, domain.length - 1)];
}
function getTooltipData({ candidate , groupScale , xScale , yScale , element  }) {
    const { metric , timeseries , timeseriesIndex  } = candidate;
    const activeTimestamp = metric.time;
    const bandwidth = groupScale.bandwidth();
    // Calculate proper positions
    const left = (groupScale(formatTimeseries(timeseries)) ?? 0) + (xScale(new Date(activeTimestamp).getTime())?.valueOf() ?? 0) + MARGINS.left + 0.5 * bandwidth;
    const top = yScale(metric.value).valueOf() + MARGINS.top;
    const colorName = getChartColor(timeseriesIndex);
    return {
        top,
        left,
        colorName,
        element,
        metric: formatTimeseriesTooltip$1(timeseries, metric, activeTimestamp)
    };
}
function formatTimeseriesTooltip$1(timeseries, metric, activeTimestamp) {
    const labelEntries = Object.entries(timeseries.labels);
    return /*#__PURE__*/ jsxs("table", {
        children: [
            /*#__PURE__*/ jsx(TimeseriesTableCaption, {
                children: activeTimestamp
            }),
            /*#__PURE__*/ jsx("thead", {
                children: /*#__PURE__*/ jsxs("tr", {
                    children: [
                        /*#__PURE__*/ jsx("th", {
                            children: timeseries.name || "value"
                        }),
                        /*#__PURE__*/ jsx("th", {
                            children: metric.value
                        })
                    ]
                })
            }),
            /*#__PURE__*/ jsx("tbody", {
                children: labelEntries.map(([key, value])=>/*#__PURE__*/ jsxs("tr", {
                        children: [
                            /*#__PURE__*/ jsxs(TimeseriesTableTd, {
                                children: [
                                    key,
                                    ":"
                                ]
                            }),
                            " ",
                            /*#__PURE__*/ jsx(TimeseriesTableTd, {
                                children: value
                            })
                        ]
                    }, key))
            })
        ]
    });
}

/**
 * Hook managing tooltips/mouseevents for BarStacked component
 */ function useTooltips(params) {
    const { groupScale , timeseriesData , xScale , yScale  } = params;
    const { showTooltip , hideTooltip  } = useContext(TooltipContext);
    const theme = useTheme();
    const onMouseMove = useHandler((event)=>{
        const { x: x0 , y: y0  } = localPoint(event) || {
            x: 0,
            y: 0
        };
        const x = x0 - MARGINS.left;
        const y = y0 - MARGINS.top;
        // Find the relevant timestamp
        const activeTimestamp = invert(xScale, x);
        if (activeTimestamp === undefined) {
            hideTooltip();
            return;
        }
        // Convert x to value as it would be inside the step of the scale
        // You can consider it to be x % xScale.step()
        // but with some additional math due considering padding + clamp logic
        // to avoid issues at the boundary of the graph
        const xInTimescale = getValueInsideScale(x, xScale);
        const candidate = getCandidate({
            x: xInTimescale,
            xScale: groupScale,
            timeseriesData,
            activeTimestamp: new Date(activeTimestamp).toISOString(),
            y,
            yScale
        });
        if (!candidate) {
            hideTooltip();
            return;
        }
        const svg = event.currentTarget.ownerSVGElement;
        const tooltipData = svg && getTooltipData({
            candidate,
            xScale,
            yScale,
            element: svg,
            groupScale,
            theme
        });
        if (!tooltipData) {
            hideTooltip();
            return;
        }
        showTooltip(tooltipData);
    });
    return {
        onMouseMove,
        onMouseLeave: hideTooltip
    };
}

const DefaultBars = /*#__PURE__*/ memo(function DefaultBars(props) {
    const { groupScale , timeseriesData , xScale , yScale  } = props;
    const { onMouseMove , onMouseLeave  } = useTooltips({
        groupScale,
        timeseriesData,
        xScale,
        yScale
    });
    const theme = useTheme();
    const dataItems = useMemo(()=>toDataItems(timeseriesData), [
        timeseriesData
    ]);
    const { xMax , yMax  } = useContext(ChartSizeContext);
    const bandwidth = groupScale.bandwidth();
    const { focusedTimeseries  } = useContext(FocusedTimeseriesStateContext);
    const seriesData = useMemo(()=>{
        return timeseriesData.map((timeseries, index)=>{
            const colorName = getChartColor(index);
            return {
                timeseries,
                index,
                x: groupScale(formatTimeseries(timeseries)),
                colorName
            };
        });
    }, [
        timeseriesData,
        groupScale
    ]);
    return /*#__PURE__*/ jsxs(Fragment, {
        children: [
            dataItems.map((dataItem, index)=>/*#__PURE__*/ jsx(Group, {
                    transform: `translate(${xScale(new Date(dataItem[dateKey]).getTime())}, 0)`,
                    children: seriesData.map(({ timeseries , x , colorName  }, keyIndex)=>{
                        const value = dataItem.data.get(timeseries);
                        if (value === undefined) {
                            return null;
                        }
                        const color = theme[colorName];
                        return /*#__PURE__*/ jsx(Bar, {
                            id: `stack-${index}-${keyIndex}`,
                            x: x,
                            y: yScale(value),
                            height: yMax - yScale(value),
                            width: bandwidth,
                            stroke: color,
                            fill: color,
                            fillOpacity: 0.1,
                            opacity: focusedTimeseries === null || focusedTimeseries === timeseries ? 1 : 0.2
                        }, formatTimeseries(timeseries, {
                            sortLabels: false
                        }));
                    })
                }, dataItem[dateKey])),
            /*#__PURE__*/ jsx(Bar, {
                width: xMax,
                height: yMax,
                fill: "transparent",
                onMouseMove: onMouseMove,
                onMouseLeave: onMouseLeave
            })
        ]
    });
});

const Series = /*#__PURE__*/ memo(function Series({ metrics , xScale , yScale , yMax , strokeColor , fillColor , id , highlight =false  }) {
    return /*#__PURE__*/ jsxs(Fragment, {
        children: [
            /*#__PURE__*/ jsx(Threshold, {
                id: id,
                data: metrics,
                x: (d)=>xScale(x$1(d)) ?? 0,
                y0: (d)=>yScale(y$1(d)) ?? 0,
                y1: yScale(0),
                clipAboveTo: 0,
                clipBelowTo: yMax,
                aboveAreaProps: {
                    fill: fillColor
                },
                // Keep this one around to spot any incorrect threshold computations.
                belowAreaProps: {
                    fill: "violet"
                }
            }),
            /*#__PURE__*/ jsx(Area, {
                data: metrics,
                x: (d)=>xScale(x$1(d)) ?? 0,
                y: (d)=>yScale(y$1(d)) ?? 0,
                stroke: strokeColor,
                strokeWidth: highlight ? 1.5 : 1,
                fill: fillColor
            })
        ]
    });
});

const Line = /*#__PURE__*/ memo(function Line({ xScale , yScale , metrics , index , yMax , highlight =false  }) {
    const theme = useTheme();
    const color = theme[getChartColor(index)];
    return /*#__PURE__*/ jsxs(Fragment, {
        children: [
            /*#__PURE__*/ jsx(LinearGradient, {
                id: `line-${index}`,
                from: color,
                to: color,
                fromOpacity: 0.15,
                toOpacity: 0.03,
                toOffset: "23%"
            }),
            /*#__PURE__*/ jsx(Series, {
                id: index.toString(),
                metrics: metrics,
                xScale: xScale,
                yScale: yScale,
                yMax: yMax,
                // Do naive color selection for now.
                // Later make colors fixed per time series.
                strokeColor: color,
                highlight: highlight,
                fillColor: `url(#line-${index})`
            })
        ]
    });
});

const x = (metric)=>new Date(metric.time).getTime();
const y = (metric)=>metric.value;
const Lines = /*#__PURE__*/ memo(function Lines({ timeseriesData , xScale , yScale  }) {
    const { xMax , yMax  } = useContext(ChartSizeContext);
    const { showTooltip , hideTooltip  } = useContext(TooltipContext);
    const handleTooltip = useHandler((event)=>{
        const displayed = timeseriesData.filter((series)=>series.visible);
        const args = toClosestPointArgs({
            event,
            xScale,
            yScale
        });
        const [metric, seriesIndex] = closestMetric({
            timeseriesData: displayed,
            ...args
        });
        if (metric !== null && seriesIndex !== null) {
            const left = xScale(x(metric)) + MARGINS.left;
            const top = yScale(y(metric)) + MARGINS.top;
            const timeseries = displayed[seriesIndex];
            // metric should not be undefined, but if it is we shouldn't continue
            if (timeseries === undefined) {
                hideTooltip();
                return;
            }
            // Find the absoluteIndex so the tooltip color still matches
            // if an element is hidden
            const absoluteIndex = timeseriesData.indexOf(timeseries);
            const svg = event.currentTarget.ownerSVGElement;
            if (svg) {
                showTooltip({
                    colorName: getChartColor(absoluteIndex),
                    metric: formatTimeseriesTooltip(timeseries, metric),
                    element: svg,
                    left,
                    top
                });
            }
        } else {
            hideTooltip();
        }
    });
    const { focusedTimeseries  } = useContext(FocusedTimeseriesStateContext);
    return /*#__PURE__*/ jsxs(Fragment, {
        children: [
            timeseriesData.map((timeseries, index)=>timeseries.visible && /*#__PURE__*/ jsx(Group, {
                    opacity: focusedTimeseries === null || focusedTimeseries === timeseries ? 1 : 0.2,
                    children: /*#__PURE__*/ jsx(Line, {
                        index: index,
                        xScale: xScale,
                        yScale: yScale,
                        metrics: timeseries.metrics,
                        yMax: yMax,
                        highlight: focusedTimeseries === timeseries
                    })
                }, formatTimeseries(timeseries, {
                    sortLabels: false
                }))),
            /*#__PURE__*/ jsx(Bar, {
                width: xMax,
                height: yMax,
                fill: "transparent",
                onMouseMove: handleTooltip,
                onMouseLeave: hideTooltip
            })
        ]
    });
});
function closestMetric({ timeseriesData , xRange , yRange  }) {
    let metric = null;
    let seriesIndex = null;
    let minLen = Number.MAX_SAFE_INTEGER;
    for (const [i, series] of timeseriesData.entries()){
        const candidates = series.metrics.filter((p)=>insideRange(x(p), xRange) && insideRange(y(p), yRange));
        // In order to get a length that is to scale calculate a factor
        // based on the range of the x and y values.
        // This is to offset the fact that the x and y ranges can be on very different scales.
        const xFactor = xRange.high - xRange.low;
        const yFactor = yRange.high - yRange.low;
        for (const p of candidates){
            const xLen = Math.pow((x(p) - xRange.value) / xFactor, 2);
            const yLen = Math.pow((y(p) - yRange.value) / yFactor, 2);
            const len = xLen + yLen;
            if (len < minLen) {
                minLen = len;
                seriesIndex = i;
                metric = p;
            }
        }
    }
    return [
        metric,
        seriesIndex
    ];
}
function formatTimeseriesTooltip(timeseries, metric) {
    return /*#__PURE__*/ jsxs("table", {
        children: [
            /*#__PURE__*/ jsx(TimeseriesTableCaption, {
                children: metric.time
            }),
            /*#__PURE__*/ jsx("thead", {
                children: /*#__PURE__*/ jsxs("tr", {
                    children: [
                        /*#__PURE__*/ jsx("th", {
                            children: timeseries.name || "value"
                        }),
                        /*#__PURE__*/ jsx("th", {
                            children: metric.value
                        })
                    ]
                })
            }),
            /*#__PURE__*/ jsx("tbody", {
                children: Object.entries(timeseries.labels).map(([key, value])=>/*#__PURE__*/ jsxs("tr", {
                        children: [
                            /*#__PURE__*/ jsxs(TimeseriesTableTd, {
                                children: [
                                    key,
                                    ":"
                                ]
                            }),
                            /*#__PURE__*/ jsx(TimeseriesTableTd, {
                                children: value
                            })
                        ]
                    }, key))
            })
        ]
    });
}

function ChartContent({ timeseriesData , xScaleProps , yScale  }) {
    if (xScaleProps.graphType === "line" && xScaleProps.stackingType === "none") {
        return /*#__PURE__*/ jsx(Lines, {
            timeseriesData: timeseriesData,
            xScale: xScaleProps.xScale,
            yScale: yScale
        });
    }
    if (xScaleProps.graphType === "line") {
        return /*#__PURE__*/ jsx(Areas, {
            timeseriesData: timeseriesData,
            xScale: xScaleProps.xScale,
            yScale: yScale,
            asPercentage: xScaleProps.stackingType === "percentage"
        });
    }
    if (xScaleProps.stackingType === "none") {
        return /*#__PURE__*/ jsx(DefaultBars, {
            groupScale: xScaleProps.groupScale,
            timeseriesData: timeseriesData,
            xScale: xScaleProps.xScale,
            yScale: yScale
        });
    }
    return /*#__PURE__*/ jsx(BarsStacked, {
        timeseriesData: timeseriesData,
        xScale: xScaleProps.xScale,
        yScale: yScale,
        asPercentage: xScaleProps.stackingType === "percentage"
    });
}

function Bottom({ yMax , xScale , xScaleFormatter , strokeDasharray  }) {
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
    return /*#__PURE__*/ jsx(AxisBottom, {
        top: yMax,
        scale: xScale,
        stroke: colorBase300,
        hideTicks: true,
        tickFormat: xScaleFormatter,
        tickLabelProps: ()=>axisBottomTickLabelProps,
        strokeDasharray: strokeDasharray
    });
}
var Bottom$1 = /*#__PURE__*/ memo(Bottom);

const GridWithAxes = /*#__PURE__*/ memo(function GridWithAxes({ xMax , yMax , xScale , yScale , xScaleFormatter , gridColumnsShown =true , gridBordersShown =true , gridDashArray  }) {
    const [targetLower = 0, targetUpper = 0] = yScale.domain();
    const { colorBase300  } = useTheme();
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
            /*#__PURE__*/ jsx(GridRows, {
                scale: temporaryScale,
                width: xMax,
                height: yMax,
                stroke: colorBase300,
                strokeDasharray: gridDashArray
            }),
            gridBordersShown && /*#__PURE__*/ jsx("line", {
                x1: xMax,
                x2: xMax,
                y1: 0,
                y2: yMax,
                stroke: colorBase300,
                strokeWidth: 1,
                strokeDasharray: gridDashArray
            }),
            gridColumnsShown && /*#__PURE__*/ jsx(GridColumns, {
                scale: xScale,
                width: xMax,
                height: yMax,
                stroke: colorBase300,
                strokeDasharray: gridDashArray
            }),
            /*#__PURE__*/ jsx(Bottom$1, {
                xMax: xMax,
                xScale: xScale,
                yMax: yMax,
                xScaleFormatter: xScaleFormatter,
                strokeDasharray: gridDashArray
            }),
            /*#__PURE__*/ jsx(AxisLeft, {
                scale: temporaryScale,
                orientation: Orientation.left,
                stroke: colorBase300,
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

function ZoomBar() {
    const { yMax  } = useContext(ChartSizeContext);
    const controlsState = useContext(InteractiveControlsStateContext);
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

function MainChartContent(props) {
    const { width , height , xMax , yMax  } = useContext(ChartSizeContext);
    const interactiveControlsState = useContext(InteractiveControlsStateContext);
    const { xScaleProps , yScale  } = useScales(props);
    const { onMouseDown , onMouseUp , onMouseEnter , onMouseMove , graphContentRef  } = useMouseControls(props);
    const [shiftKeyPressed, setShiftKeyPressed] = useState(false);
    const onKeyHandler = (event)=>{
        setShiftKeyPressed(event.shiftKey);
    };
    const onMouseMoveWithShiftDetection = (event)=>{
        setShiftKeyPressed(event.shiftKey);
        onMouseMove(event);
    };
    const { graphTooltip , showTooltip , hideTooltip  } = useTooltip(props.showTooltip);
    const tooltipApiValue = useMemo(()=>({
            showTooltip,
            hideTooltip
        }), [
        showTooltip,
        hideTooltip
    ]);
    const theme = useTheme();
    // Use a custom formatter when `xScale` is a `ScaleBand<number>`. We want to
    // display the time, not the timestamp (number).
    const xScaleFormatter = xScaleProps.graphType === "bar" && xScaleProps.stackingType === "none" ? getTimeFormatter(xScaleProps.xScale) : undefined;
    return /*#__PURE__*/ jsx(TooltipContext.Provider, {
        value: tooltipApiValue,
        children: /*#__PURE__*/ jsx(StyledContainer, {
            onKeyDown: onKeyHandler,
            onKeyUp: onKeyHandler,
            onMouseDown: onMouseDown,
            onMouseMove: onMouseMoveWithShiftDetection,
            onMouseUp: onMouseUp,
            onMouseEnter: onMouseEnter,
            children: /*#__PURE__*/ jsxs("svg", {
                width: width,
                height: height,
                style: {
                    cursor: getCursorFromState(interactiveControlsState, shiftKeyPressed)
                },
                children: [
                    /*#__PURE__*/ jsx("defs", {
                        children: /*#__PURE__*/ jsx("clipPath", {
                            id: "clip-chart",
                            children: /*#__PURE__*/ jsx("rect", {
                                x: 0,
                                y: 0,
                                width: xMax,
                                height: yMax
                            })
                        })
                    }),
                    /*#__PURE__*/ jsxs(Group, {
                        left: MARGINS.left,
                        top: MARGINS.top,
                        children: [
                            /*#__PURE__*/ jsx(GridWithAxes, {
                                xMax: xMax,
                                yMax: yMax,
                                xScale: xScaleProps.xScale,
                                yScale: yScale,
                                xScaleFormatter: xScaleFormatter,
                                gridColumnsShown: props.gridColumnsShown,
                                gridBordersShown: props.gridBordersShown,
                                gridDashArray: props.gridDashArray
                            }),
                            /*#__PURE__*/ jsx(Group, {
                                innerRef: graphContentRef,
                                clipPath: "url(#clip-chart)",
                                children: /*#__PURE__*/ jsx(ChartContent, {
                                    timeseriesData: props.timeseriesData,
                                    xScaleProps: xScaleProps,
                                    yScale: yScale
                                })
                            }),
                            /*#__PURE__*/ jsx(ZoomBar, {})
                        ]
                    }),
                    graphTooltip && /*#__PURE__*/ jsxs("g", {
                        children: [
                            /*#__PURE__*/ jsx(Line$1, {
                                from: {
                                    x: graphTooltip.left,
                                    y: 0
                                },
                                to: {
                                    x: graphTooltip.left,
                                    y: yMax
                                },
                                stroke: theme[graphTooltip.colorName],
                                strokeWidth: 1,
                                pointerEvents: "none",
                                strokeDasharray: "1 1"
                            }),
                            /*#__PURE__*/ jsx("circle", {
                                cx: graphTooltip.left,
                                cy: graphTooltip.top,
                                r: 4,
                                fill: theme[graphTooltip.colorName],
                                pointerEvents: "none"
                            })
                        ]
                    })
                ]
            })
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
        children: /*#__PURE__*/ jsx(InteractiveControlsContext.Provider, {
            value: interactiveControls,
            children: /*#__PURE__*/ jsx(InteractiveControlsStateContext.Provider, {
                value: interactiveControlsState,
                children: /*#__PURE__*/ jsx(StyledChartSizeContainerProvider, {
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
        children: /*#__PURE__*/ jsx(InnerMetricsChart, {
            ...props
        })
    });
}
const InnerMetricsChart = /*#__PURE__*/ memo(function InnerMetricsChart(props) {
    const { readOnly , legendShown =true , chartControlsShown =true , stackingControlsShown =true  } = props;
    return /*#__PURE__*/ jsxs(FocusedTimeseriesContextProvider, {
        children: [
            !readOnly && chartControlsShown && /*#__PURE__*/ jsx(ChartControls, {
                ...props,
                stackingControlsShown: stackingControlsShown
            }),
            /*#__PURE__*/ jsx(MainChartContent, {
                ...props
            }),
            legendShown && /*#__PURE__*/ jsx(Legend, {
                ...props
            })
        ]
    });
});
const StyledChartSizeContainerProvider = styled(ChartSizeContainerProvider)`
    display: flex;
    gap: 12px;
    flex-direction: column;
`;

export { MetricsChart };
//# sourceMappingURL=index.js.map
