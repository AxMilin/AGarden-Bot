export async function onRequestGet() {
  try {
    const res = await fetch("http://gag.axmilin.in.th:22377/api/stocks", {
      headers: {
        "User-Agent": "curl/8.0",
        "Accept": "application/json",
      }
    });

    if (!res.ok) {
      return new Response(`Backend error: ${res.status}`, { status: 502 });
    }

    const data = await res.json();

    return new Response(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store"
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (err) {
    return new Response(`Function error: ${err.message}`, { status: 500 });
  }
}
