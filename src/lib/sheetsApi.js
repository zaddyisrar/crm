const SHEETS_API_URL =
  process.env.NEXT_PUBLIC_SHEETS_API_URL ||
  "https://script.google.com/macros/s/AKfycbyfKcV9GbVOx4plAJvEPr8vxJae-joJXt95HKYpsqU5PD3uy2Dk4V8oODFdCtFZcuoY8Q/exec";

export async function sheetsPost(payload) {
  const res = await fetch(SHEETS_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!data.success) {
    throw new Error(data.message || "Google Sheets request failed");
  }

  return data;
}

export async function sheetsGet(action) {
  const res = await fetch(
    `${SHEETS_API_URL}?action=${encodeURIComponent(action)}`
  );

  const data = await res.json();

  if (!data.success) {
    throw new Error(data.message || "Google Sheets request failed");
  }

  return data;
}