const SHEETS_API_URL =
  "https://script.google.com/macros/s/AKfycbyzzUV2cotR-IC03HBuIH5NvZMbDziikSTW6JhgU0gYNuLAax2a-fi_CIHU9TCLkM3j1g/exec";

export async function sheetsPost(payload) {
  const res = await fetch(SHEETS_API_URL, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return res.json();
}

export async function sheetsGet(action) {
  const res = await fetch(`${SHEETS_API_URL}?action=${action}`);
  return res.json();
}