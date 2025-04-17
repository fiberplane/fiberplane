import { noop } from "@/lib/utils";
import type { DBTable } from "@/types";
import { z } from "zod";
import { CodeMirrorJsonEditor } from "../CodeMirror";

// Schema for the columns section
export const StateTableColumnsSchema = z
  .object({
    id: z.tuple([z.literal("string")]),
    state: z.tuple([z.literal("null"), z.literal("string")]),
  })
  .strict();

export type StateTableColumns = z.infer<typeof StateTableColumnsSchema>;
export type StateDBTable = DBTable<StateTableColumns>;

export const StateTableName = "cf_agents_state";

export function StateTableView(props: { table: StateDBTable }) {
  const {
    table: { data },
  } = props;

  if (data.length === 0) {
    return (
      <div className="text-muted-foreground text-center py-6">Empty State</div>
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
  const state = stateColumn.state && JSON.parse(stateColumn.state);
  const stateString = JSON.stringify(state, null, 2);

  return (
    <div className="mt-2 rounded-lg bg-background px-4 py-1.5">
      <CodeMirrorJsonEditor
        value={stateString}
        onChange={noop}
        minHeight="auto"
        readOnly
      />
    </div>
  );
}
export function isStateTable(
  name: string,
  table: StateDBTable,
): table is StateDBTable {
  return (
    name === StateTableName &&
    StateTableColumnsSchema.safeParse(table.columns).success
  );
}
