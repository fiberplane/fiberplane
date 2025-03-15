import { useEffect, useState } from "react";
import { Button } from "./ui/button";

import { useQuery } from "@tanstack/react-query";
import { AgentDetails } from "./AgentDetails";
import type { DurableObjectsResult } from "@/types";

const unset = Symbol("unset");

function useListAgents() {
	return useQuery<DurableObjectsResult>({
		queryKey: ["list_agents"],
		queryFn: () => fetch("/fp-agents/api/agents").then((res) => res.json()),
	});
}

export function App() {
	const { data, isLoading } = useListAgents();
	const [selectedAgent, setSelectedAgent] = useState<string | typeof unset>(
		unset,
	);

	useEffect(() => {
		if (data?.success) {
			setSelectedAgent(data.durableObjects.bindings[0].name);
		}
	}, [data]);

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (!data?.success) {
		return <div>Empty</div>;
	}

	const binding = data.durableObjects.bindings.find(
		(a) => a.name === selectedAgent,
	);
	return (
		<div className="h-full w-full grid gap-4 grid-cols-[200px_auto]">
			<div className="grid gap-2 min-w-0 border border-neutral-200 px-4 rounded-md h-full grid-rows-[auto_1fr]">
				<h1 className="text-lg p-2">Detected Agents</h1>
				<div className="w-full grid gap-2 h-full">
					{data.durableObjects.bindings.map((agent) => (
						<Button
							onClick={() => setSelectedAgent(agent.name)}
							key={agent.name}
							className="border border-neutral-400 cursor-pointer justify-start items-start"
						>
							{agent.name}
						</Button>
					))}
				</div>
			</div>
			<div>
				{selectedAgent !== unset && binding ? (
					<AgentDetails agent={binding} />
				) : (
					<div>Select an agent</div>
				)}
			</div>
		</div>
	);
}
