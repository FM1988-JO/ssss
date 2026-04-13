import type { AssetCategory, AssetCondition } from '../types';

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

export async function analyzeAssetPhoto(
  imageDataUrl: string,
  apiKey: string,
): Promise<AIAnalysisResult> {
  // Extract base64 data from data URL
  const base64Match = imageDataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!base64Match) throw new Error('Invalid image data');

  const mimeType = `image/${base64Match[1]}`;
  const base64Data = base64Match[2];

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Analyze this photo of a company asset and extract the following details. Return ONLY a valid JSON object with these exact fields:

{
  "name": "descriptive name for this asset",
  "category": "one of: it-equipment, furniture, vehicles, tools, buildings, other",
  "subcategory": "specific type like Laptop, Desk, Sedan, Power Tool, etc.",
  "brand": "brand/manufacturer name if visible",
  "model": "model name/number if visible",
  "condition": "one of: new, good, fair, poor, damaged - based on visual appearance",
  "notes": "any additional observations about the asset"
}

Important rules:
- Return ONLY the JSON object, no markdown, no explanation
- If you cannot determine a field, use an empty string ""
- For category, you MUST use one of: it-equipment, furniture, vehicles, tools, buildings, other
- For condition, you MUST use one of: new, good, fair, poor, damaged
- Be as specific as possible for brand and model`,
              },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Data,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 500,
        },
      }),
    },
  );

  if (!response.ok) {
    const err = await response.text();
    if (response.status === 400 || response.status === 403) {
      throw new Error('Invalid API key. Please check your Gemini API key in Settings.');
    }
    throw new Error(`Gemini API error: ${err}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('No response from AI');

  // Parse JSON from response (handle potential markdown wrapping)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Could not parse AI response');

  const parsed = JSON.parse(jsonMatch[0]);

  // Validate and sanitize
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
