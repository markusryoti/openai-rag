import type { Document } from "./types";

// This is a placeholder for your actual retrieval system
// In a real application, you would:
// 1. Create embeddings for the user's query
// 2. Search for similar embeddings in your vector database
// 3. Return the most relevant documents

// Mock documents for demonstration
const documents: Document[] = [
  {
    id: "1",
    content:
      "Next.js is a React framework for building full-stack web applications. You use React Components to build user interfaces, and Next.js for additional features and optimizations.",
    metadata: {
      source: "Next.js Documentation",
      url: "https://nextjs.org/docs",
    },
  },
  {
    id: "2",
    content:
      "React is a JavaScript library for building user interfaces. React lets you build user interfaces out of individual pieces called components.",
    metadata: { source: "React Documentation", url: "https://react.dev" },
  },
  {
    id: "3",
    content:
      "Tailwind CSS is a utility-first CSS framework that can be composed to build any design, directly in your markup.",
    metadata: {
      source: "Tailwind CSS Documentation",
      url: "https://tailwindcss.com/docs",
    },
  },
  {
    id: "4",
    content:
      "OpenAI offers a spectrum of models with different levels of power suitable for different tasks.",
    metadata: {
      source: "OpenAI Documentation",
      url: "https://platform.openai.com/docs/models",
    },
  },
  {
    id: "5",
    content:
      "RAG (Retrieval Augmented Generation) is a technique that enhances LLM outputs by retrieving relevant information from external sources before generating a response.",
    metadata: {
      source: "AI Research Paper",
      url: "https://example.com/rag-paper",
    },
  },
];

export async function getRelevantDocuments(query: string): Promise<Document[]> {
  // This is a simple keyword-based search for demonstration
  // In a real application, you would use vector similarity search
  const keywords = query
    .toLowerCase()
    .split(" ")
    .map((s) => s.replace(/[!?.,"'`;:-]/g, ""));

  return documents
    .filter((doc) => {
      const docContent = doc.content.toLowerCase().replace(/[!?.,"'`;:-]/g, "");
      return keywords.some(
        (keyword) => keyword.length > 3 && docContent.includes(keyword),
      );
    })
    .slice(0, 3); // Return top 3 matches
}
