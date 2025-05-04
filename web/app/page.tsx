import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col justify-center min-h-screen bg-gray-100">
      <div className="text-center py-20">
        <h1 className="text-5xl font-extrabold mb-8">Rag Chat</h1>
        <p className="font-2xl font-gray-500 mb-10">
          App for demonstrating RAG-system with a Python API for handling vector
          embeddings
        </p>
        <Button>
          <Link href="/dashboard">Get Started</Link>
        </Button>
      </div>
    </main>
  );
}
