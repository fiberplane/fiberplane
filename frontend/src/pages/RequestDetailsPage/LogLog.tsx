import { MizuMessage } from "@/queries";
import { hasStringMessage, objectHasName, objectHasStack } from "@/utils";
import { LogLevel } from "./RequestDetailsPage";
import { StackTrace } from "./StackTrace";
import { SectionHeading } from "./shared";

export function LogLog({
  message,
  level,
}: { message: string | MizuMessage; level: LogLevel }) {
  const description =
    typeof message === "string"
      ? message
      : hasStringMessage(message)
        ? message.message
        : "";
  const stack = objectHasStack(message) ? message.stack : null;

  const name = objectHasName(message) ? message.name : null;

  const heading = `console.${level || "info"}${name && ": " + name}`;
  const id = `log-${level || "info"}-${name}`;

  return (
    <section className="flex flex-col gap-4" id={id}>
      <div className="flex items-center gap-4">
        <SectionHeading className="font-mono">{heading}</SectionHeading>
      </div>

      {description && <p>{description}</p>}
      {stack && (
        <div className="mt-2 max-h-[200px] overflow-y-scroll text-gray-400">
          <StackTrace stackTrace={stack} />
        </div>
      )}
    </section>
  );
}
