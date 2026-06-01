export const config = { runtime: "edge" };
export default async function handler(req) {
  const h = {"Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"POST, OPTIONS","Access-Control-Allow-Headers":"Content-Type"};
  if (req.method === "OPTIONS") return new Response(null, { headers: h });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: h });
  try {
    const { messages, systemPrompt } = await req.json();
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": "Bearer " + process.env.GROQ_API_KEY },
            body: JSON.stringify({ model: "llama-3.1-8b-instant", messages: [{ role: "system", content: systemPrompt || "You are a helpful assistant." }, ...messages.slice(-20)], stream: true, max_tokens: 1024, temperature: 0.7 })
      });
    if (!r.ok) return new Response(await r.text(), { status: 500, headers: h });
    return new Response(r.body, { headers: { ...h, "Content-Type": "text/event-stream", "Cache-Control": "no-cache" } });
} catch(e) { return new Response(e.message, { status: 500, headers: h }); }
}
