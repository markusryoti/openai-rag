import type { Document } from "./types";

type SearchResponse = {
  results: Document[];
};

export async function getRelevantDocuments(query: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_EMBEDDINGS_API}/search`, {
    method: "POST",
    body: JSON.stringify({ query, top_k: 3 }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = (await res.json()) as SearchResponse;

  console.log(data);

  return data.results;
}
