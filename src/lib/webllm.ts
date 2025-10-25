import type { Agent } from "@/data/agents";
import { CreateMLCEngine, type MLCEngineInterface } from "@mlc-ai/web-llm";

let enginePromise: Promise<MLCEngineInterface> | null = null;

const DEFAULT_MODEL = "Llama-3.1-8B-Instruct-q4f32_1-MLC";

export async function getEngine(modelId: string = DEFAULT_MODEL): Promise<MLCEngineInterface> {
  if (!enginePromise) {
    enginePromise = CreateMLCEngine(modelId, {
      initProgressCallback: (report) => {
        // You can wire this to a toast if desired
        console.debug("WebLLM init:", report.text);
      },
    });
  }
  return enginePromise;
}

export type GenerateArgs = {
  agent: Agent;
  userText: string;
  language?: string; // target language, e.g., "Hindi", "Tamil"
};

function buildSystemPrompt(agent: Agent, language?: string) {
  const parts: string[] = [];
  parts.push(
    `You are ${agent.name}, an AI companion with a ${agent.personality} personality.`
  );
  if (agent.description) parts.push(agent.description);
  if (agent.traits?.length) parts.push(`Traits: ${agent.traits.join(", ")}.`);
  parts.push(
    "Respond concisely in 1–2 sentences, natural and conversational, and stay in character."
  );
  parts.push(
    "Avoid explicit content, slurs, or harmful advice. Be supportive and emotionally intelligent."
  );
  if (language) {
    parts.push(
      `Reply in ${language}. If the user's message uses a different language/script, prefer their language.`
    );
  } else {
    parts.push(
      "Reply in the language the user used; if unclear, default to English."
    );
  }
  return parts.join(" \n");
}

export async function generateWithWebLLM({ agent, userText, language }: GenerateArgs): Promise<string> {
  const engine = await getEngine();
  const systemPrompt = buildSystemPrompt(agent, language);
  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userText },
  ];
  const completion = await engine.chat.completions.create({
    messages,
    temperature: 0.8,
    top_p: 0.9,
  });
  const text = completion.choices?.[0]?.message?.content || "";
  return text.trim();
}