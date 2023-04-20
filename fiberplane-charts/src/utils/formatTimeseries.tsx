import { Fragment, memo } from "react";
import styled from "styled-components";

import type { Timeseries } from "../types";
import { sortBy } from "./sortBy";

/**
 * Format metric to string. This is used to generate human readable strings
 *
 * Sorting of the labels is optional, but in the UI can be handy to more quickly find
 * a specific label in the text
 */
export function formatTimeseries(
    timeseries: Timeseries,
    { sortLabels = true }: { sortLabels?: boolean } = {},
): string {
    const { name, labels } = timeseries;
    let entries = Object.entries(labels);
    entries = sortLabels ? sortBy(entries, ([key]) => key) : entries;

    return `${name}{${entries.map(([k, v]) => `"${k}":"${v}"`).join(", ")}}`;
}

const Emphasis = styled.span`
  background-color: ${({ theme }) => theme.colorBase200};
  /* TODO (Jacco): we should try and find out what to do with this styling */
  /* stylelint-disable-next-line scale-unlimited/declaration-strict-value */
  font-weight: 600;
  border-radius: ${({ theme }) => theme.borderRadius500};
  padding: 1px 4px;
  display: inline-block;
`;

export const FormattedTimeseries = memo(function FormattedTimeseries({
    metric,
    sortLabels = true,
    emphasizedKeys = [],
}: {
    metric: Timeseries;
    sortLabels?: boolean;
    emphasizedKeys?: string[];
}): JSX.Element {
    const { name, labels } = metric;

    let labelEntries: Array<[string, string]> = Object.entries(labels);
    if (sortLabels) {
        labelEntries = sortBy(labelEntries, ([key]) => key);
    }

    return (
        <>
            {name && `${name}: `}
            {labelEntries.map(([key, value], index) => (
                <Fragment key={key}>
                    {index > 0 && ", "}
                    <span className={key in emphasizedKeys ? "emphasize" : ""}>
                        {key}
                        {value && [
                            ": ",
                            emphasizedKeys.includes(key) ? (
                                <Emphasis key={key}>{value}</Emphasis>
                            ) : (
                                value
                            ),
                        ]}
                    </span>
                </Fragment>
            ))}
        </>
    );
});
