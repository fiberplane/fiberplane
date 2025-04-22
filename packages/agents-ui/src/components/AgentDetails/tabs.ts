// Tab ordering preference
export const TAB_ORDER = ["state", "messages", "schedule", "mcp", "gateways"];

// Map DB table names to friendly tab IDs
export const tableToTabMap: Record<string, string> = {
  cf_ai_chat_agent_messages: "messages",
  cf_agents_schedules: "schedule",
  cf_agents_state: "state",
};

// Map friendly tab IDs to titles for display
export const tabTitleMap: Record<string, string> = {
  messages: "Messages",
  schedule: "Schedule",
  state: "State",
  mcp: "Servers (MCP)",
  gateways: "Gateways",
};
