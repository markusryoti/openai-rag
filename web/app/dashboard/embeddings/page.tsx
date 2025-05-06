import { Separator } from "@/components/ui/separator";
import AddTextEmbeddings from "@/components/text-embedding";
import AddPdfEmbeddings from "@/components/pdf-embedding";

export default function AddEmbeddings() {
  return (
    <>
      <AddTextEmbeddings />
      <Separator className="my-10" />
      <AddPdfEmbeddings />
    </>
  );
}
