import { AIProjectClient } from "@azure/ai-projects";
import { DefaultAzureCredential } from "@azure/identity";

const defaultAgentVersion = "1";

export function createFoundryProjectClient() {
  const endpoint = process.env.AZURE_FOUNDRY_PROJECT_ENDPOINT;

  if (!endpoint) {
    console.error("[foundry] missing project endpoint");
    throw new Error("AZURE_FOUNDRY_PROJECT_ENDPOINT is not configured.");
  }

  console.log("[foundry] creating project client", {
    hasEndpoint: Boolean(endpoint),
    auth: "DefaultAzureCredential",
  });

  return new AIProjectClient(endpoint, new DefaultAzureCredential());
}

export async function generateFoundryAgentResponse(prompt: string) {
  const agentName = process.env.AZURE_FOUNDRY_AGENT_NAME;

  if (!agentName) {
    console.error("[foundry] missing agent name");
    throw new Error("AZURE_FOUNDRY_AGENT_NAME is not configured.");
  }

  console.log("[foundry] generating agent response", {
    agentName,
    agentVersion: process.env.AZURE_FOUNDRY_AGENT_VERSION ?? defaultAgentVersion,
    promptLength: prompt.length,
  });

  const projectClient = createFoundryProjectClient();
  const openAIClient = projectClient.getOpenAIClient();

  console.log("[foundry] creating conversation");

  const conversation = await openAIClient.conversations.create({
    items: [
      {
        type: "message",
        role: "user",
        content: prompt,
      },
    ],
  });

  console.log("[foundry] conversation created", {
    conversationId: conversation.id,
  });

  console.log("[foundry] creating response", {
    conversationId: conversation.id,
    agentName,
    agentVersion: process.env.AZURE_FOUNDRY_AGENT_VERSION ?? defaultAgentVersion,
  });

  const response = await openAIClient.responses.create(
    {
      conversation: conversation.id,
    },
    {
      body: {
        agent_reference: {
          name: agentName,
          version:
            process.env.AZURE_FOUNDRY_AGENT_VERSION ?? defaultAgentVersion,
          type: "agent_reference",
        },
      },
    },
  );

  console.log("[foundry] response received", {
    hasOutputText: Boolean(response.output_text),
    outputLength: response.output_text?.length ?? 0,
  });

  return response.output_text;
}
