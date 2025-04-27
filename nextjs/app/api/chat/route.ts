import OpenAI from "openai";
import { getRelevantDocuments } from "@/lib/retrieval";

// Create OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Get the latest user message
    const latestMessage = messages[messages.length - 1];

    // Retrieve relevant documents based on the user's query
    const relevantDocs = await getRelevantDocuments(latestMessage.content);

    // Create a context from the retrieved documents
    const context = relevantDocs.map((doc) => doc.content).join("\n\n");

    // Create a system message with the context
    const systemMessage = `You are a helpful assistant that answers questions based on the following context:
    
${context}

If the question cannot be answered based on the context, say that you don't know and only use the information provided in the context. But if the information is included in the context, feel free to add more details and explanation outside of the context.`;

    // Create a new readable stream
    const stream = new ReadableStream({
      async start(controller) {
        // Create a streaming response from OpenAI
        const completion = await openai.chat.completions.create({
          model: "gpt-4.1-nano",
          messages: [{ role: "system", content: systemMessage }, ...messages],
          stream: true,
        });

        // Process each chunk as it arrives
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            // Encode the content as a Uint8Array and enqueue it
            const encoder = new TextEncoder();
            controller.enqueue(encoder.encode(content));
          }
        }
        controller.close();
      },
    });

    // Return the stream as the response
    return new Response(stream);
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "An error occurred" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
