export async function onRequestGet() {
  try {
    const res = await fetch("http://65.108.103.151:22377/api/stocks", {
      headers: {
        "User-Agent": "curl/8.0",
        "Accept": "application/json",
        "Referer": "http://65.108.103.151:22377",
        "Origin": "http://65.108.103.151:22377"
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
      }
    });
  } catch (err) {
    return new Response(`Function error: ${err.message}`, { status: 500 });
  }
}
