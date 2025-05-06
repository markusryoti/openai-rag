"use server";

type ServerActionResponse = {
  message?: string;
  error?: string;
};

type ResponseOk = {
  detail: string;
};

export async function addTextEmbedding(
  prevState: ServerActionResponse,
  formData: FormData
): Promise<ServerActionResponse> {
  const text = formData.get("embedding-text");

  if (!text) {
    return { error: "No text provided" };
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_EMBEDDINGS_API}/embed`, {
      method: "POST",
      body: JSON.stringify({ text }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      return { error: `Bad status from creating embeddings: ${res.status}` };
    }

    const data = (await res.json()) as ResponseOk;

    console.log(data);

    return { message: data.detail };
  } catch (e) {
    console.error(e);
    return { error: "Something went wrong uploading the text" };
  }
}

export async function addPdfEmbedding(
  prevState: ServerActionResponse,
  formData: FormData
): Promise<ServerActionResponse> {
  const file = formData.get("pdf");

  if (!file) {
    return { error: "No file provided" };
  }

  try {
    const newForm = new FormData();

    newForm.append("file", file);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_EMBEDDINGS_API}/upload-pdf`,
      {
        method: "POST",
        body: newForm,
      }
    );

    if (!res.ok) {
      return { error: `Bad status from creating embeddings: ${res.status}` };
    }

    const data = (await res.json()) as ResponseOk;

    console.log(data);

    return { message: data.detail };
  } catch (e) {
    console.error(e);
    return { error: "Something went wrong uploading the text" };
  }
}
