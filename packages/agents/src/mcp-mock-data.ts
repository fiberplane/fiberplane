import type {
  MCPPrompt,
  Resource,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

export interface ServerData {
  tools: Tool[];
  resources: Resource[];
  prompts: MCPPrompt[];
}

export const mockMCPData: ServerData[] = [
  {
    tools: [
      {
        serverName: "market-data-server",
        name: "get_stock_price",
        description: "Retrieve current or historical stock price data",
        inputSchema: {
          type: "object",
          properties: {
            symbol: { type: "string" },
            date: { type: "string" },
            includeVolume: { type: "boolean" },
          },
          required: ["symbol"],
        },
        returns: { type: "object" },
      },
      {
        serverName: "market-data-server",
        name: "calculate_moving_average",
        description:
          "Calculate moving average for a stock over a specified period",
        inputSchema: {
          type: "object",
          properties: {
            symbol: { type: "string" },
            days: { type: "number" },
            type: { type: "string" },
          },
          required: ["symbol", "days"],
        },
        returns: { type: "object" },
      },
    ],
    resources: [
      {
        serverName: "market-data-server",
        name: "market_indices",
        description: "Major market indices data for global markets",
        uri: "vault://resource/market-data/indices",
        schema: {
          type: "object",
          properties: {
            region: { type: "string" },
            period: { type: "string" },
          },
          required: ["region"],
        },
      },
    ],
    prompts: [
      {
        serverName: "market-data-server",
        name: "market_summary",
        description: "Generate a summary of current market conditions",
        template:
          "Provide a summary of the {{market}} market for {{date}} including key movements and trends.",
        parameters: {
          type: "object",
          properties: {
            market: { type: "string" },
            date: { type: "string" },
          },
          required: ["market"],
        },
      },
    ],
  },
  {
    tools: [
      {
        serverName: "portfolio-management-server",
        name: "calculate_portfolio_risk",
        description: "Calculate risk metrics for an investment portfolio",
        inputSchema: {
          type: "object",
          properties: {
            portfolioId: { type: "string" },
            riskMeasures: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  parameters: { type: "object" },
                },
              },
            },
            timeHorizon: { type: "string" },
          },
          required: ["portfolioId"],
        },
        returns: { type: "object" },
      },
    ],
    resources: [
      {
        serverName: "portfolio-management-server",
        name: "portfolio_holdings",
        description: "Current holdings data for investment portfolios",
        uri: "vault://resource/portfolio/holdings",
        schema: {
          type: "object",
          properties: {
            portfolioId: { type: "string" },
            asOfDate: { type: "string" },
          },
          required: ["portfolioId"],
        },
      },
    ],
    prompts: [
      {
        serverName: "portfolio-management-server",
        name: "portfolio_recommendation",
        description: "Generate investment recommendations for a portfolio",
        template:
          "Based on the current market conditions and the risk profile of {{portfolioType}}, provide recommended adjustments for the following objectives: {{objectives}}",
        parameters: {
          type: "object",
          properties: {
            portfolioType: { type: "string" },
            objectives: { type: "string" },
          },
          required: ["portfolioType"],
        },
      },
    ],
  },
  {
    tools: [
      {
        serverName: "financial-analysis-server",
        name: "analyze_financial_statement",
        description:
          "Analyze company financial statements and provide key metrics",
        inputSchema: {
          type: "object",
          properties: {
            companyId: { type: "string" },
            statementType: {
              type: "string",
              enum: ["income", "balance", "cashflow"],
            },
            fiscalPeriod: {
              type: "object",
              properties: {
                year: { type: "number" },
                quarter: { type: "number" },
              },
            },
          },
          required: ["companyId", "statementType"],
        },
        returns: { type: "object" },
      },
    ],
    resources: [],
    prompts: [
      {
        serverName: "financial-analysis-server",
        name: "financial_health_assessment",
        description: "Generate a financial health assessment for a company",
        template:
          "Provide a comprehensive assessment of {{company}}'s financial health based on their {{period}} statements, focusing on: {{metrics}}",
        parameters: {
          type: "object",
          properties: {
            company: { type: "string" },
            period: { type: "string" },
            metrics: { type: "string" },
          },
          required: ["company", "period"],
        },
      },
    ],
  },
];
