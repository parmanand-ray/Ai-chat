import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

function getRetrySeconds(error) {
  // Gemini error message me kabhi-kabhi "Please retry in 58s" aata hai
  const message = error?.message || "";

  const match = message.match(/retry in (\d+)/i);

  if (match && match[1]) {
    return Number(match[1]);
  }

  // Default fallback
  return 60;
}

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: "Message is required",
      });
    }

    const finalPrompt = `
You are a helpful AI chatbot.

Rules:
- Do not use ** anywhere.
- Do not use markdown formatting.
- Give clear and simple answers.
- Reply in the same language as the user.
- Keep the answer helpful and easy to understand.

User message:
${message}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: finalPrompt,
    });

    return res.status(200).json({
      success: true,
      message: response.text,
    });
  } catch (error) {
    console.error("Gemini API Error:", error);

    // 429 Error Handling
    if (error.status === 429) {
      const retryAfter = getRetrySeconds(error);

      res.set("Retry-After", String(retryAfter));

      return res.status(429).json({
        success: false,
        error: `Gemini API limit cross ho gayi hai. Please ${retryAfter} seconds baad try karein.`,
        retryAfter: retryAfter,
      });
    }

    // Other errors
    return res.status(500).json({
      success: false,
      error: "Something went wrong. Please try again later.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
