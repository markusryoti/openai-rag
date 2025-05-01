import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addPdfEmbedding, addTextEmbedding } from "../actions";

export default function AddEmbeddings() {
  return (
    <main className="container mx-auto">
      <h2 className="text-2xl">Add text embeddings</h2>
      <div className="py-10">
        <form action={addTextEmbedding} className="flex flex-col gap-4">
          <Textarea
            placeholder="Add text to your knowledge-base"
            name="embedding-text"
            className="max-w-5xl h-48"
          />

          <Button className="w-48">Submit</Button>
        </form>
      </div>
      <h2 className="text-2xl">Add pdf file</h2>
      <div className="py-10">
        <form action={addPdfEmbedding} className="flex flex-col gap-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="pdf">Pdf</Label>
            <Input id="pdf" name="pdf" type="file" accept=".pdf" />
          </div>
          <Button className="w-48">Submit</Button>
        </form>
      </div>
    </main>
  );
}
