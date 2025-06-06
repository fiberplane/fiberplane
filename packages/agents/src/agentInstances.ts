import { type KebabCase, toKebabCase } from "./utils";

type Namespace = KebabCase<string>;
type AgentDetails = {
  className: string;
  instances: Array<string>;
};
const agentInstances = new Map<Namespace, AgentDetails>();

export function registerAgent(agent: string) {
  const namespace = toKebabCase(agent);
  if (!agentInstances.has(namespace)) {
    agentInstances.set(namespace, {
      className: agent,
      instances: [],
    });
  }
}

export function registerAgentInstance(agent: string, instance: string) {
  const namespace = toKebabCase(agent);
  if (!agentInstances.has(namespace)) {
    agentInstances.set(namespace, {
      className: agent,
      instances: [],
    });
  }
  const details = agentInstances.get(namespace);

  if (!details) {
    // Note: this should not happen if the agent was registered correctly
    throw new Error(`Agent details not found for namespace: ${namespace}`);
  }

  const existingInstances = details.instances;
  if (!existingInstances.includes(instance)) {
    existingInstances.push(instance);
  }
}

export function getAgents() {
  return Array.from(agentInstances.entries()).map(([namespace, details]) => ({
    ...details,
    id: namespace as string,
  }));
}
