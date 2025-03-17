import type { ColumnType, Table } from "@/plugin/utils";

type TableRendererProps<
  C extends Record<string, ColumnType[]> = Record<string, ColumnType[]>,
> = {
  table: Table<C>;
  title?: string;
  className?: string;
  maxHeight?: string;
};

/**
 * A component that renders data from a Table type with Tailwind styling
 */
export function DataTableView<
  C extends Record<string, ColumnType[]> = Record<string, ColumnType[]>,
>({ table, title, className = "" }: TableRendererProps<C>) {
  const columnNames = Object.keys(table.columns);

  // Helper function to render cell content based on value type
  const renderCellContent = (value: unknown) => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400 italic">null</span>;
    }

    if (typeof value === "object") {
      if (Array.isArray(value)) {
        return <span className="text-blue-600">[Array]</span>;
      }
      return <span className="text-green-600">{JSON.stringify(value)}</span>;
    }

    if (typeof value === "boolean") {
      return <span className="text-purple-600">{value.toString()}</span>;
    }

    return value.toString();
  };

  return (
    <div
      className={`rounded-md border border-gray-200 shadow grid grid-rows-[auto_1fr] ${className}`}
    >
      {title && (
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-700">{title}</h3>
        </div>
      )}

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="sticky top-0 bg-white">
          <tr>
            {columnNames.map((column) => (
              <th
                key={column}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                <div className="flex items-center font-medium">
                  <span>{column}</span>
                  <span className="ml-1 text-gray-400 text-xs">
                    [{table.columns[column].join("|")}]
                  </span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {table.data.length === 0 ? (
            <tr>
              <td
                colSpan={columnNames.length}
                className="px-6 py-4 text-center text-sm text-gray-500 italic"
              >
                No data available
              </td>
            </tr>
          ) : (
            table.data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={rowIndex % 2 === 0 ? "bg-gray-50" : "bg-white"}
              >
                {columnNames.map((column) => (
                  <td
                    key={`${rowIndex}-${column}`}
                    className="px-6 py-2 whitespace-nowrap text-sm text-gray-800"
                  >
                    {renderCellContent(row[column])}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Usage example:
 *
 * import { TableRenderer } from '../components/TableRenderer';
 * import { DatabaseResult } from '../plugin/utils';
 *
 * function MyComponent({ result }: { result: DatabaseResult }) {
 *   return (
 *     <div>
 *       {Object.entries(result).map(([tableName, table]) => (
 *         <TableRenderer
 *           key={tableName}
 *           table={table}
 *           title={tableName}
 *           className="mb-6"
 *         />
 *       ))}
 *     </div>
 *   );
 * }
 */
