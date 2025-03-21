import React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { z } from "zod";
import type { DBTable } from "@/types";
import { ListSection } from "../ListSection";

// Database schema representation
const ScheduleDBSchema = z.object({
  id: z.string(),
  callback: z.string().nullable(),
  payload: z.string().nullable(),
  type: z.string(),
  time: z.number().nullable(),
  delayInSeconds: z.union([z.number(), z.null()]),
  cron: z.string().nullable(),
  created_at: z.number().nullable(),
});

export const ScheduleColumnsSchema = z.object({
  id: z.tuple([z.literal("string")]),
  callback: z.tuple([z.literal("null"), z.literal("string")]),
  payload: z.tuple([z.literal("null"), z.literal("string")]),
  type: z.tuple([z.literal("string")]),
  time: z.tuple([z.literal("null"), z.literal("number")]),
  delayInSeconds: z.tuple([z.literal("null"), z.literal("number")]),
  cron: z.tuple([z.literal("null"), z.literal("string")]),
  created_at: z.tuple([z.literal("null"), z.literal("number")]),
});

export type ScheduleDBColumns = z.infer<typeof ScheduleColumnsSchema>;
export type ScheduleDBTable = DBTable<ScheduleDBColumns>;

export type ScheduleDB = z.infer<typeof ScheduleDBSchema>;

// Application model types
type ScheduleBase<T = string> = {
  id: string;
  callback: string;
  payload: T;
  created_at?: number;
};

type ScheduledType = ScheduleBase & {
  type: "scheduled";
  time: number;
};

type DelayedType = ScheduleBase & {
  type: "delayed";
  time: number;
  delayInSeconds: number;
};

type CronType = ScheduleBase & {
  type: "cron";
  time: number;
  cron: string;
};

export type Schedule = ScheduledType | DelayedType | CronType;

interface ScheduleTableProps {
  table: ScheduleDBTable;
  className?: string;
}

const getScheduleTypeColor = (type: Schedule["type"]) => {
  switch (type) {
    case "scheduled":
      return "default";
    case "delayed":
      return "secondary";
    case "cron":
      return "outline";
    default:
      return "default";
  }
};

/**
 *
 * @param timestamp assumed to be in seconds
 * @returns time as a string
 */
const formatTimestamp = (timestamp: number) => {
  return format(new Date(timestamp * 1000), "PPp"); // Format: Aug 14, 2023, 2:30 PM
};

const getScheduleTypeDetails = (schedule: Schedule) => {
  switch (schedule.type) {
    case "scheduled":
      return {
        typeLabel: "One-time",
        details: (
          <>
            Executes at{" "}
            <span className="text-foreground">
              {formatTimestamp(schedule.time)}
            </span>
          </>
        ),
      };
    case "delayed":
      return {
        typeLabel: "Fixed delay",
        details: (
          <>
            Executes in{" "}
            <span className="text-foreground">{schedule.delayInSeconds}</span>{" "}
            seconds (at{" "}
            <span className="text-foreground">
              {formatTimestamp(schedule.time)}
            </span>
            )
          </>
        ),
      };
    case "cron":
      return {
        typeLabel: "Recurring",
        details: (
          <>
            Next execution at{" "}
            <span className="text-foreground">
              {formatTimestamp(schedule.time)}
            </span>
            , pattern: <span className="text-foreground">{schedule.cron}</span>
          </>
        ),
      };
    default:
      return {
        typeLabel: "Unknown",
        details: "",
      };
  }
};

// Transform DB schedule to application model
export const transformSchedule = (dbSchedule: ScheduleDB): Schedule | null => {
  // Validate the DB record first
  const parseResult = ScheduleDBSchema.safeParse(dbSchedule);
  if (!parseResult.success) {
    console.error("Invalid schedule record:", parseResult.error);
    return null;
  }

  const data = parseResult.data;

  // Check for required fields
  if (!data.callback || !data.time) {
    console.error("Schedule missing required fields:", data);
    return null;
  }

  // Parse payload if it exists
  const parsedPayload = data.payload ? JSON.parse(data.payload) : "";

  // Create base schedule object
  const baseSchedule = {
    id: data.id,
    callback: data.callback,
    payload: parsedPayload,
    ...(data.created_at && { created_at: data.created_at }),
  };

  // Create type-specific schedule
  switch (data.type) {
    case "scheduled":
      return {
        ...baseSchedule,
        type: "scheduled",
        time: data.time,
      };

    case "delayed":
      if (data.delayInSeconds === null) {
        console.error("Delayed schedule missing delayInSeconds:", data);
        return null;
      }
      return {
        ...baseSchedule,
        type: "delayed",
        time: data.time,
        delayInSeconds: data.delayInSeconds,
      };

    case "cron":
      if (!data.cron) {
        console.error("Cron schedule missing cron expression:", data);
        return null;
      }
      return {
        ...baseSchedule,
        type: "cron",
        time: data.time,
        cron: data.cron,
      };

    default:
      console.error("Unknown schedule type:", data.type);
      return null;
  }
};

// DB response schema
export const ScheduleTable = z.object({
  columns: z.record(z.array(z.string())),
  data: z.array(ScheduleDBSchema),
});

export type DBResponse = z.infer<typeof ScheduleTable>;

export const ScheduleTableView = ({ table, className }: ScheduleTableProps) => {
  const schedules = table.data.map(transformSchedule);

  return (
    <TooltipProvider>
      <ListSection title="Scheduled tasks">
        <Table className={className}>
          {/* <TableCaption>Scheduled tasks configuration</TableCaption> */}
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Callback</TableHead>
              {/* <TableHead>Execution Time</TableHead> */}
              <TableHead>Details</TableHead>
              <TableHead>Payload</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schedules.map((schedule) => {
              if (schedule === null) {
                return null;
              }
              const { typeLabel, details } = getScheduleTypeDetails(schedule);

              console.log("schedule", schedule);
              return (
                <TableRow key={schedule.id}>
                  <TableCell className="font-mono text-xs">
                    {schedule.id}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getScheduleTypeColor(schedule.type)}>
                      {typeLabel}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono">
                    {schedule.callback}
                  </TableCell>
                  {/* <TableCell>{formatTimestamp(schedule.time)}</TableCell> */}
                  <TableCell className="text-muted-foreground">
                    {details}
                  </TableCell>
                  <TableCell>
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge variant="secondary" className="cursor-help">
                          Payload
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <pre className="text-xs p-2 max-w-xs overflow-auto">
                          {typeof schedule.payload === "string"
                            ? schedule.payload
                            : JSON.stringify(schedule.payload, null, 2)}
                        </pre>
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
            {schedules.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-6 text-muted-foreground"
                >
                  No scheduled tasks found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ListSection>
    </TooltipProvider>
  );
};
