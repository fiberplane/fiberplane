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
  const details = agentInstances.get(namespace) || {
    className: agent,
    instances: [],
  };

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
