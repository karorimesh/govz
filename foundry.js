import { DefaultAzureCredential } from "@azure/identity";
import { AIProjectClient } from "@azure/ai-projects";

const endpoint = "https://karoricodex.services.ai.azure.com/api/projects/karodex";
const agentName = "govlive";
const agentVersion = "1";

// Create AI Project client
const projectClient = new AIProjectClient(endpoint, new DefaultAzureCredential());

async function main() {
  // Use the agent to create a conversation and generate a response
  const openAIClient = projectClient.getOpenAIClient();
  // Create conversation with initial user message
  console.log("\nCreating conversation with initial user message...");
  const conversation = await openAIClient.conversations.create({
    items: [{ type: "message", role: "user", content: "What is the size of France in square miles?" }]
    });
  console.log("Created conversation with initial user message (id: ");
  console.log(conversation.id);
  
  // Generate response using the agent
  console.log("\nGenerating response...");
  const response = await openAIClient.responses.create(
      {
          conversation: conversation.id,
      },
      {
          body: { agent: { name: agentName, version: agentVersion, type: "agent_reference" } },
      },
  );
  console.log("Response output: ");
  console.log(response.output_text);
}

main();