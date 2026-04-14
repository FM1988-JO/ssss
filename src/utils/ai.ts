import type { AssetCategory, AssetCondition } from '../types';

export type AIProvider = 'groq' | 'claude' | 'chatgpt' | 'huggingface' | 'gemini';

export interface AIAnalysisResult {
  name: string;
  category: AssetCategory;
  subcategory: string;
  brand: string;
  model: string;
  condition: AssetCondition;
  notes: string;
}

const VALID_CATEGORIES: AssetCategory[] = [
  'it-equipment', 'furniture', 'vehicles', 'tools', 'buildings', 'other',
];

const VALID_CONDITIONS: AssetCondition[] = [
  'new', 'good', 'fair', 'poor', 'damaged',
];

const PROMPT = `Analyze this photo of a company asset and extract details. Return ONLY a valid JSON object:

{
  "name": "descriptive name for this asset",
  "category": "one of: it-equipment, furniture, vehicles, tools, buildings, other",
  "subcategory": "specific type like Laptop, Desk, Sedan, Power Tool, etc.",
  "brand": "brand/manufacturer name if visible",
  "model": "model name/number if visible",
  "condition": "one of: new, good, fair, poor, damaged - based on visual appearance",
  "notes": "any additional observations about the asset"
}

Rules:
- Return ONLY the JSON object, no markdown, no explanation
- If you cannot determine a field, use an empty string ""
- For category, you MUST use one of: it-equipment, furniture, vehicles, tools, buildings, other
- For condition, you MUST use one of: new, good, fair, poor, damaged`;

export async function analyzeAssetPhoto(
  imageDataUrl: string,
  apiKey: string,
  provider: AIProvider = 'claude',
): Promise<AIAnalysisResult> {
  const base64Match = imageDataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!base64Match) throw new Error('Invalid image data');

  if (provider === 'groq') {
    return analyzeWithGroq(imageDataUrl, apiKey);
  }
  if (provider === 'claude') {
    return analyzeWithOpenRouter(imageDataUrl, apiKey, 'anthropic/claude-sonnet-4');
  }
  if (provider === 'chatgpt') {
    return analyzeWithOpenRouter(imageDataUrl, apiKey, 'openai/gpt-4o-mini');
  }
  if (provider === 'gemini') {
    return analyzeWithGemini(base64Match[1], base64Match[2], apiKey);
  }
  return analyzeWithHuggingFace(imageDataUrl, apiKey);
}

// Groq - 100% free, no credit card
async function analyzeWithGroq(
  imageDataUrl: string,
  apiKey: string,
): Promise<AIAnalysisResult> {
  const response = await fetch(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.2-90b-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: PROMPT },
              { type: 'image_url', image_url: { url: imageDataUrl } },
            ],
          },
        ],
        max_tokens: 500,
        temperature: 0.1,
      }),
    },
  );

  if (!response.ok) {
    const err = await response.text();
    if (response.status === 401) {
      throw new Error('Invalid API key. Check your Groq key in Settings.');
    }
    if (response.status === 429) {
      throw new Error('Rate limit. Wait a moment and try again.');
    }
    throw new Error(`Groq error: ${err}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('No response from AI');

  return parseAIResponse(text);
}

// Claude & ChatGPT via OpenRouter (free credits, browser-compatible)
async function analyzeWithOpenRouter(
  imageDataUrl: string,
  apiKey: string,
  model: string,
): Promise<AIAnalysisResult> {
  const response = await fetch(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: PROMPT },
              { type: 'image_url', image_url: { url: imageDataUrl } },
            ],
          },
        ],
        max_tokens: 500,
        temperature: 0.1,
      }),
    },
  );

  if (!response.ok) {
    const err = await response.text();
    if (response.status === 401 || response.status === 403) {
      throw new Error('Invalid API key. Check your OpenRouter key in Settings.');
    }
    if (response.status === 402) {
      throw new Error('No credits. Add free credits at openrouter.ai/credits');
    }
    if (response.status === 429) {
      throw new Error('Rate limit. Wait a moment and try again.');
    }
    throw new Error(`AI error: ${err}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('No response from AI');

  return parseAIResponse(text);
}

async function analyzeWithHuggingFace(
  imageDataUrl: string,
  apiKey: string,
): Promise<AIAnalysisResult> {
  const response = await fetch(
    'https://router.huggingface.co/novita/v3/openai/chat/completions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-maverick',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: PROMPT },
              { type: 'image_url', image_url: { url: imageDataUrl } },
            ],
          },
        ],
        max_tokens: 500,
        temperature: 0.1,
      }),
    },
  );

  if (!response.ok) {
    const err = await response.text();
    if (response.status === 401 || response.status === 403) {
      throw new Error('Invalid token. Check your Hugging Face token in Settings.');
    }
    if (response.status === 429) {
      throw new Error('Rate limit reached. Wait a minute and try again.');
    }
    throw new Error(`AI error: ${err}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('No response from AI');

  return parseAIResponse(text);
}

async function analyzeWithGemini(
  imageType: string,
  base64Data: string,
  apiKey: string,
): Promise<AIAnalysisResult> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: PROMPT },
            { inline_data: { mime_type: `image/${imageType}`, data: base64Data } },
          ],
        }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 500 },
      }),
    },
  );

  if (!response.ok) {
    if (response.status === 400 || response.status === 403) {
      throw new Error('Invalid API key. Check your Gemini key in Settings.');
    }
    if (response.status === 429) {
      throw new Error('Gemini free tier not available in your region. Please switch to Groq in Settings - it works everywhere.');
    }
    throw new Error('Gemini failed. Try switching to Groq in Settings.');
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('No response from AI');

  return parseAIResponse(text);
}

function parseAIResponse(text: string): AIAnalysisResult {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Could not parse AI response');

  const parsed = JSON.parse(jsonMatch[0]);

  return {
    name: String(parsed.name || ''),
    category: VALID_CATEGORIES.includes(parsed.category) ? parsed.category : 'other',
    subcategory: String(parsed.subcategory || ''),
    brand: String(parsed.brand || ''),
    model: String(parsed.model || ''),
    condition: VALID_CONDITIONS.includes(parsed.condition) ? parsed.condition : 'good',
    notes: String(parsed.notes || ''),
  };
}
