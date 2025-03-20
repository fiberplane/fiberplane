import { useSSE } from "./useSSE";

// unction useAgentDB(namespace: string, instance: string) {
//   return useQuery({
//     queryKey: ["agent_db", namespace, instance],
//     queryFn: () =>
//       // fetch(`/agents/${namespace}/${instance}/admin/db`).then((res) =>
//       fetch(`/fp-agents/api/agents/${namespace}/db`).then((res) =>
//         res.json(),
//       ) as Promise<DatabaseResult>,
//   });
// }

export function EventsView(props: {
  namespace: string;
  instance: string;
}) {
  const { namespace, instance } = props;
  const result = useSSE(`/agents/${namespace}/${instance}/admin/events`);
  console.log("result", result);
  return <div></div>;
}
