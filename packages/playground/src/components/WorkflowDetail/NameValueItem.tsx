import { NOT_FOUND } from "./utils";

export function NameValueItem(props: { name: string; value: unknown }) {
  const { name, value } = props;
  const isString = typeof value === "string";
  return (
    <div className="text-sm grid grid-cols-[200px_auto] max-w-full overflow-hidden min-h-[30px] items-center">
      <div>
        {name}
        {isString && (
          <span className="pl-1 text-xs text-muted-foreground">(string)</span>
        )}
      </div>

      <div className="overflow-x-auto">
        {value === NOT_FOUND ? (
          <>
            <em className="text-muted-foreground">No value set</em>
          </>
        ) : (
          <>
            <pre className="max-w-full overflow-auto font-mono bg-background">
              <code>
                {isString
                  ? value
                  : JSON.stringify(value, null, "\t").replaceAll(
                      '],\n\t"',
                      '],\n\n\t"',
                    )}
              </code>
            </pre>
          </>
        )}
      </div>
    </div>
  );
}
