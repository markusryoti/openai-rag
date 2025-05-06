"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActionState } from "react";
import { addPdfEmbedding } from "@/app/actions";
import { Loader2 } from "lucide-react";

const initialState = {
  message: "",
  error: "",
};

export default function AddPdfEmbeddings() {
  const [state, action, pending] = useActionState(
    addPdfEmbedding,
    initialState
  );

  return (
    <>
      <h2 className="text-2xl">Add pdf file</h2>
      <div className="py-10">
        <form action={action} className="flex flex-col gap-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="pdf">Pdf</Label>
            <Input id="pdf" name="pdf" type="file" accept=".pdf" />
          </div>
          <Button disabled={pending} className="w-48">
            {pending && <Loader2 className="animate-spin" />}
            Submit
          </Button>
          {state.error && <p className="text-red-500 pt-4">{state.error}</p>}
          {state.message && !pending && (
            <p className="text-gray-600 pt-4">{state.message}</p>
          )}
        </form>
      </div>
    </>
  );
}
