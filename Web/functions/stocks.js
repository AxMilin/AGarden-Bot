export async function onRequestGet() {
  try {
    const res = await fetch("http://65.108.103.151:22377/api/stocks");

    if (!res.ok) {
      return new Response(`Backend error: ${res.status}`, { status: 502 });
    }

    const data = await res.json();

    return new Response(JSON.stringify(data), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache"
      }
    });
  } catch (err) {
    return new Response(`Function error: ${err.message}`, { status: 500 });
  }
}
