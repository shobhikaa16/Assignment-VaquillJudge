// src/utils/geminiAI.ts
export async function getGeminiJudgeResponse(messages: { role: string; content: string }[]) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  // Example POST request to Gemini API — adjust URL & body per Gemini spec
  const response = await fetch("https://api.gemini.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gemini-v1", // replace with actual model name
      messages,
      max_tokens: 500,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
