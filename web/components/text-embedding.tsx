"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useActionState } from "react";
import { addTextEmbedding } from "@/app/actions";
import { Loader2 } from "lucide-react";

const initialState = {
  message: "",
  error: "",
};

export default function AddTextEmbeddings() {
  const [state, action, pending] = useActionState(
    addTextEmbedding,
    initialState
  );

  return (
    <>
      <h2 className="text-2xl">Add text embeddings</h2>
      <div className="py-10">
        <form action={action} className="flex flex-col gap-4">
          <Textarea
            placeholder="Add text to your knowledge-base"
            name="embedding-text"
            className="max-w-7xl h-[400px]"
          />

          <Button disabled={pending} className="w-48">
            {pending && <Loader2 className="animate-spin" />}
            Submit
          </Button>
          {state.error && <p className="text-red-500 pt-4">{state.error}</p>}
          {state.message && (
            <p className="text-gray-600 pt-4">{state.message}</p>
          )}
        </form>
      </div>
    </>
  );
}
