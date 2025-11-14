import axios from "axios";

/**
 * Sends extracted text to backend AI proxy
 * @param text Extracted PDF text or case description
 */
export async function analyzeTextWithGeminiProxy(text: string): Promise<string> {
  try {
    const response = await axios.post("http://localhost:5000/analyze", { text });
    return response.data.response;
  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    throw new Error("Failed to analyze text");
  }
}
