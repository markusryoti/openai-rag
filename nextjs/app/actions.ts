"use server";

export async function addTextEmbedding(formData: FormData) {
  const text = formData.get("embedding-text");

  if (!text) {
    throw new Error("No text provided");
  }

  const res = await fetch("http://fastapi:8000/embed", {
    method: "POST",
    body: JSON.stringify({ text }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();

  console.log(data);
}

export async function addPdfEmbedding(formData: FormData) {
  const file = formData.get("pdf");

  if (!file) {
    throw new Error("No file provided");
  }

  const newForm = new FormData();
  newForm.append("file", file);

  console.log("new form data", newForm);

  const res = await fetch("http://fastapi:8000/upload-pdf", {
    method: "POST",
    body: newForm,
  });

  const data = await res.json();

  console.log(data);
}
