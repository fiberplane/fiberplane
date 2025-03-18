import { AlertCircle, Calendar, Clock } from "lucide-react";
import React, { useMemo } from "react";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Table as FpTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

import type { Table } from "@/types";
import { z } from "zod";

// Define the schema for the 'columns' section
export const ScheduledColumnsSchema = z.object({
  id: z.tuple([z.enum(["string"])]),
  callback: z.tuple([z.enum(["string"])]),
  payload: z.tuple([z.enum(["string"])]),
  type: z.tuple([z.enum(["string"])]),
  time: z.tuple([z.enum(["number"])]),
  delayInSeconds: z.tuple([z.enum(["null"])]),
  cron: z.tuple([z.enum(["null"]), z.enum(["string"])]),
  created_at: z.tuple([z.enum(["number"])]),
});

type ScheduledColumns = z.infer<typeof ScheduledColumnsSchema>;
type T = Table<ScheduledColumns>;
type D = T["data"];

const ScheduledTasksView = () => {
  // Mock data based on the provided JSON
  const rawData = {
    columns: {
      id: ["string"],
      message: ["string"],
      created_at: ["string"],
    },
    data: [
      {
        id: "YI5AyGRY1P39bQAK",
        message:
          '{"id":"YI5AyGRY1P39bQAK","createdAt":"2025-03-18T20:15:38.286Z","role":"user","content":"please send me the message \\"boo\\" at 12 AM","parts":[{"type":"text","text":"please send me the message \\"boo\\" at 12 AM"}]}',
        created_at: "2025-03-18 20:15:43",
      },
      {
        id: "msg-zntnO17DRbJM7mINNpkjB3kn",
        message:
          '{"role":"assistant","id":"msg-zntnO17DRbJM7mINNpkjB3kn","createdAt":"2025-03-18T20:15:43.324Z","content":"The message \\"boo\\" has been scheduled to be sent to you at 12:00 AM.","toolInvocations":[{"state":"result","step":0,"args":{"type":"scheduled","when":"2025-03-19T00:00:00.000Z","payload":"boo"},"toolCallId":"call_kMKrozXs3xLOLMEBLjJaFSnF","toolName":"scheduleTask","result":"Task scheduled for 2025-03-19T00:00:00.000Z"}],"parts":[{"type":"text","text":""},{"type":"tool-invocation","toolInvocation":{"state":"result","step":0,"args":{"type":"scheduled","when":"2025-03-19T00:00:00.000Z","payload":"boo"},"toolCallId":"call_kMKrozXs3xLOLMEBLjJaFSnF","toolName":"scheduleTask","result":"Task scheduled for 2025-03-19T00:00:00.000Z"}},{"type":"text","text":"The message \\"boo\\" has been scheduled to be sent to you at 12:00 AM."}]}',
        created_at: "2025-03-18 20:15:43",
      },
    ],
  };

  // Process the data to extract scheduled tasks
  const scheduledTasks = useMemo(() => {
    const tasks = [];

    for (const item of rawData.data) {
      try {
        const messageObj = JSON.parse(item.message);

        // Look for tool invocations that contain scheduled tasks
        if (messageObj.toolInvocations) {
          for (const invocation of messageObj.toolInvocations) {
            if (
              invocation.toolName === "scheduleTask" &&
              invocation.args.type === "scheduled"
            ) {
              tasks.push({
                id: item.id,
                taskId: invocation.toolCallId,
                scheduledTime: new Date(invocation.args.when),
                payload: invocation.args.payload,
                createdAt: new Date(item.created_at),
                status: invocation.state || "pending",
              });
            }
          }
        }
      } catch (e) {
        console.error("Error parsing message JSON:", e);
      }
    }

    return tasks;
  }, [rawData]);

  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Calculate remaining time until scheduled task
  const getRemainingTime = (scheduledTime: number) => {
    const now = Date.now();
    const diff = scheduledTime - now;

    if (diff <= 0) {
      return "Due now";
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }

    return `${minutes}m remaining`;
  };

  // Determine badge color based on time remaining
  const getStatusBadge = (scheduledTime: number) => {
    const now = Date.now();
    const diff = scheduledTime - now;

    if (diff <= 0) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          Overdue
        </Badge>
      );
    }

    if (diff <= 1000 * 60 * 60) {
      // Less than 1 hour
      return (
        <Badge
          variant="secondary"
          className="flex items-center gap-1 bg-orange-100 text-orange-800"
        >
          <Clock className="w-3 h-3" />
          Imminent
        </Badge>
      );
    }

    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        <Clock className="w-3 h-3" />
        Scheduled
      </Badge>
    );
  };

  return (
    <div className="w-full shadow-sm border rounded-xl bg-white">
      <div className="px-6 py-4 bg-gray-50 border-b rounded-t-xl flex items-center gap-2">
        <Calendar className="w-5 h-5 text-gray-600" />
        <h2 className="text-lg font-semibold">Scheduled Tasks</h2>
      </div>
      <div className="p-0">
        {scheduledTasks.length > 0 ? (
          <div className="relative w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">
                    Payload
                  </th>
                  <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">
                    Scheduled For
                  </th>
                  <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">
                    Created At
                  </th>
                  <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground">
                    Time Remaining
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {scheduledTasks.map((task) => (
                  <tr
                    key={task.taskId}
                    className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                  >
                    <td className="p-2 align-middle">
                      {getStatusBadge(task.scheduledTime.getTime())}
                    </td>
                    <td className="p-2 align-middle font-medium">
                      {task.payload}
                    </td>
                    <td className="p-2 align-middle">
                      {formatDate(task.scheduledTime)}
                    </td>
                    <td className="p-2 align-middle text-gray-500">
                      {formatDate(task.createdAt)}
                    </td>
                    <td className="p-2 align-middle">
                      {getRemainingTime(task.scheduledTime.getTime())}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            No scheduled tasks found
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduledTasksView;
