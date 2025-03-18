import type { Table } from "@/types";
import { CircleDot } from "lucide-react";
import { z } from "zod";
import { ListSection } from "../ListSection";

// Define the possible column types
const columnTypeEnum = z.enum([
  "string",
  "number",
  "boolean",
  "null",
  "object",
  "array",
]);

// Schema for the columns section
export const StateTableColumnsSchema = z
  .object({
    id: z.tuple([z.literal("string")]),
    state: z.tuple([z.literal("string")]),
  })
  .strict();

export type StateTableColumns = z.infer<typeof StateTableColumnsSchema>;

export const StateTableName = "cf_agents_state";

export function StateTableView(props: { table: Table<StateTableColumns> }) {
  const {
    table: { data },
  } = props;

  if (data.length === 0) {
    return (
      <div className="p-4 text-center text-foreground">No data available</div>
    );
  }

  const stateColumn = data[0];
  const wasChangedColumn = data[1];
  if (
    stateColumn?.id !== "cf_state_row_id" ||
    wasChangedColumn?.id !== "cf_state_was_changed"
  ) {
    return <div className="p-4 text-center text-foreground">Invalid data</div>;
  }

  // Parse state as json blob and display it nicely indented
  const state = JSON.parse(stateColumn.state);
  const stateString = JSON.stringify(state, null, 2);

  return (
    <ListSection
      contentClassName="p-2 bg-muted"
      title={
        <div className="flex gap-1 items-center">
          <CircleDot className="W-3.5 h-3.5" /> Agent State
        </div>
      }
      className="h-full"
    >
      <div>
        <pre className="text-foreground whitespace-pre-wrap font-mono">
          {stateString}
        </pre>
      </div>
    </ListSection>
  );
}
