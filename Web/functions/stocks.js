export async function onRequestGet() {
  const res = await fetch("http://65.108.103.151:22377/api/stocks");
  const data = await res.json();

  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache"
    }
  });
}
