import { AIProjectClient } from "@azure/ai-projects";
import { DefaultAzureCredential } from "@azure/identity";

const defaultAgentVersion = "1";

export function createFoundryProjectClient() {
  const endpoint = process.env.AZURE_FOUNDRY_PROJECT_ENDPOINT;

  if (!endpoint) {
    throw new Error("AZURE_FOUNDRY_PROJECT_ENDPOINT is not configured.");
  }

  return new AIProjectClient(endpoint, new DefaultAzureCredential());
}

export async function generateFoundryAgentResponse(prompt: string) {
  const agentName = process.env.AZURE_FOUNDRY_AGENT_NAME;

  if (!agentName) {
    throw new Error("AZURE_FOUNDRY_AGENT_NAME is not configured.");
  }

  const projectClient = createFoundryProjectClient();
  const openAIClient = projectClient.getOpenAIClient();

  const conversation = await openAIClient.conversations.create({
    items: [
      {
        type: "message",
        role: "user",
        content: prompt,
      },
    ],
  });

  const response = await openAIClient.responses.create(
    {
      conversation: conversation.id,
    },
    {
      body: {
        agent: {
          name: agentName,
          version:
            process.env.AZURE_FOUNDRY_AGENT_VERSION ?? defaultAgentVersion,
          type: "agent_reference",
        },
      },
    },
  );

  return response.output_text;
}
