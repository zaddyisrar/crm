const SHEETS_API_URL =
  process.env.NEXT_PUBLIC_SHEETS_API_URL ||
  "https://script.google.com/macros/s/AKfycbyfKcV9GbVOx4plAJvEPr8vxJae-joJXt95HKYpsqU5PD3uy2Dk4V8oODFdCtFZcuoY8Q/exec";

async function parseSheetsResponse(res) {
  const text = await res.text();

  let data;

  try {
    data = JSON.parse(text);
  } catch (error) {
    console.error("Invalid Sheets API response:", text);
    throw new Error("Invalid response from Google Sheets API");
  }

  if (!res.ok) {
    throw new Error(data.message || `Google Sheets request failed: ${res.status}`);
  }

  if (!data.success) {
    throw new Error(data.message || "Google Sheets request failed");
  }

  return data;
}

export async function sheetsPost(payload) {
  try {
    const res = await fetch(SHEETS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    return await parseSheetsResponse(res);
  } catch (error) {
    console.error("Sheets POST failed:", {
      action: payload?.action,
      error,
    });

    throw error;
  }
}

export async function sheetsGet(action, params = {}) {
  try {
    const query = new URLSearchParams({
      action,
      ...params,
    });

    const res = await fetch(`${SHEETS_API_URL}?${query.toString()}`);

    return await parseSheetsResponse(res);
  } catch (error) {
    console.error("Sheets GET failed:", {
      action,
      params,
      error,
    });

    throw error;
  }
}