// src/utils/ai.ts
export async function getAIJudgeResponse(messages: { role: string; content: string }[]) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages,
      max_tokens: 500,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenAI API error ${res.status}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}
