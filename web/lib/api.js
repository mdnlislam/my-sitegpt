// All requests to the Express server live here
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(API_URL + path, options);
  } catch {
    throw new Error("Cannot reach the server. Is it running?");
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Something went wrong");
  return data;
}

function postJson(body) {
  return {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

export const getSources = () => request("/api/sources");

export const addText = (title, text) =>
  request("/api/sources/text", postJson({ title, text }));

export const addUrl = (url) => request("/api/sources/url", postJson({ url }));

export function addFile(file) {
  const form = new FormData();
  form.append("file", file);
  return request("/api/sources/file", { method: "POST", body: form });
}

export const deleteSource = (id) =>
  request(`/api/sources/${id}`, { method: "DELETE" });

export const askQuestion = (question) =>
  request("/api/ask", postJson({ question }));
