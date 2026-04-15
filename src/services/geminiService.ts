import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface ColorSuggestion {
  name: string;
  hex: string;
  description: string;
}

export interface SkinToneAnalysis {
  undertone: string;
  contrastLevel: string;
  seasonalType: string;
  professionalReasoning: string;
}

export interface WeeklyOutfit {
  day: string;
  top: string;
  topHex: string;
  bottom: string;
  bottomHex: string;
  hijab?: string;
  hijabHex?: string;
  vibe: string;
}

export interface AnalysisResult {
  personalityColor: {
    name: string;
    hex: string;
    meaning: string;
  };
  skinToneAnalysis: SkinToneAnalysis;
  recommendedPalette: {
    tops: ColorSuggestion[];
    bottoms: ColorSuggestion[];
    hijabs?: ColorSuggestion[];
    accessories?: ColorSuggestion[];
  };
  isHijabi: boolean;
  gender: 'male' | 'female' | 'other';
  weeklyOutfits: WeeklyOutfit[];
  clothingAdvice: string;
  signatureLook?: string; // Base64 or URL for the generated image
}

export async function analyzeSelfie(base64Image: string): Promise<AnalysisResult> {
  const model = "gemini-3.1-flash-lite-preview";
  
  const prompt = `
    Perform a professional color analysis on this selfie to provide a comprehensive wardrobe color recommendation.
    
    1. Identify the skin undertone (Cool, Warm, or Neutral), contrast level, and professional Seasonal Color Type.
    2. Detect if the person in the photo is wearing a HIJAB. Set 'isHijabi' to true if they are, false otherwise.
    3. Detect the gender of the person in the photo. Set 'gender' to 'male', 'female', or 'other'.
    4. Provide a "Personality Color" representing their biometric essence.
    5. Recommend at least 7 specific colors for TOPS (shirts, jackets, etc.) and at least 7 specific colors for BOTTOMS (pants, trousers, or skirts depending on gender) that harmonize perfectly with their facial features.
    6. IF 'gender' is 'male', ensure all recommendations (Tops and Bottoms) are masculine and professional (e.g., trousers, chinos, button-downs). DO NOT recommend skirts or feminine attire for males.
    7. Recommend at least 5 specific colors for ACCESSORIES (watches, glasses, jewelry, ties, etc.) that complement the overall palette.
    8. IF 'isHijabi' is true, recommend at least 7 specific colors for HIJABS that complement the skin tone and face shape.
    10. For each color, provide a professional explanation of WHY it works for that specific category.
    11. Create a "Weekly Style Guide" (Senin to Minggu) using combinations of the recommended items. For each day, provide:
       - 'day': The name of the day (Senin, Selasa, etc.)
       - 'top': The name of the recommended top color.
       - 'topHex': The hex code of the recommended top color.
       - 'bottom': The name of the recommended bottom color.
       - 'bottomHex': The hex code of the recommended bottom color.
       - 'hijab': (Optional) The name of the recommended hijab color (only if isHijabi is true).
       - 'hijabHex': (Optional) The hex code of the recommended hijab color (only if isHijabi is true).
       - 'vibe': A short description of the style vibe (e.g., "Professional Monday").
    9. Provide general clothing advice focusing on how to coordinate these specific items for a cohesive look.
    
    The analysis must be scientifically grounded in color theory (Munsell, Itten, or Seasonal Analysis).
    
    Return the result in JSON format with 'tops' and 'bottoms' inside 'recommendedPalette', and 'weeklyOutfits' as an array.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image.split(",")[1],
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          personalityColor: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              hex: { type: Type.STRING },
              meaning: { type: Type.STRING },
            },
            required: ["name", "hex", "meaning"],
          },
          skinToneAnalysis: {
            type: Type.OBJECT,
            properties: {
              undertone: { type: Type.STRING },
              contrastLevel: { type: Type.STRING },
              seasonalType: { type: Type.STRING },
              professionalReasoning: { type: Type.STRING },
            },
            required: ["undertone", "contrastLevel", "seasonalType", "professionalReasoning"],
          },
          isHijabi: { type: Type.BOOLEAN },
          gender: { 
            type: Type.STRING,
            enum: ['male', 'female', 'other']
          },
          recommendedPalette: {
            type: Type.OBJECT,
            properties: {
              tops: {
                type: Type.ARRAY,
                minItems: 7,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    hex: { type: Type.STRING },
                    description: { type: Type.STRING },
                  },
                  required: ["name", "hex", "description"],
                },
              },
              bottoms: {
                type: Type.ARRAY,
                minItems: 7,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    hex: { type: Type.STRING },
                    description: { type: Type.STRING },
                  },
                  required: ["name", "hex", "description"],
                },
              },
              hijabs: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    hex: { type: Type.STRING },
                    description: { type: Type.STRING },
                  },
                  required: ["name", "hex", "description"],
                },
              },
              accessories: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    hex: { type: Type.STRING },
                    description: { type: Type.STRING },
                  },
                  required: ["name", "hex", "description"],
                },
              },
            },
            required: ["tops", "bottoms"],
          },
          clothingAdvice: { type: Type.STRING },
          weeklyOutfits: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.STRING },
                top: { type: Type.STRING },
                topHex: { type: Type.STRING },
                bottom: { type: Type.STRING },
                bottomHex: { type: Type.STRING },
                hijab: { type: Type.STRING },
                hijabHex: { type: Type.STRING },
                vibe: { type: Type.STRING },
              },
              required: ["day", "top", "topHex", "bottom", "bottomHex", "vibe"],
            },
          },
        },
        required: ["personalityColor", "skinToneAnalysis", "recommendedPalette", "clothingAdvice", "weeklyOutfits"],
      },
    },
  });

  return JSON.parse(response.text);
}

export async function generateVisualLook(result: AnalysisResult, originalImage: string): Promise<string> {
  const imageModel = "gemini-2.5-flash-image";
  const top = result.recommendedPalette.tops[0];
  const bottom = result.recommendedPalette.bottoms[0];
  const hijab = result.isHijabi && result.recommendedPalette.hijabs ? result.recommendedPalette.hijabs[0] : null;
  
  const maleStyles = [
    "a high-fashion sharp tailored slim-fit suit with a premium silk shirt and modern trousers, looking like a professional male model",
    "a cool professional blazer over a high-end designer knit polo and tailored chinos, with a confident model-like stance",
    "a sophisticated luxury business casual ensemble with a premium button-down shirt and perfectly fitted dress pants, high-fashion editorial style",
    "a modern avant-garde designer outfit with clean architectural lines and a sleek structured jacket, looking like a runway model",
    "a stylish high-end professional attire featuring a luxury trench coat over tailored trousers, editorial fashion photography style"
  ];

  const femaleStyles = [
    "a high-fashion sharp tailored power suit with a premium silk blouse and modern trousers, looking like a professional female model",
    "a cool professional blazer over a sophisticated designer top and an elegant high-fashion skirt, with a confident model-like stance",
    "a sophisticated luxury business casual ensemble with a premium silk blouse and perfectly fitted dress pants, high-fashion editorial style",
    "a modern avant-garde designer outfit with clean architectural lines and a stylish structured dress, looking like a runway model",
    "a stylish high-end professional attire featuring elegant draping and perfectly tailored trousers, editorial fashion photography style"
  ];

  const clothingStyles = result.gender === 'male' ? maleStyles : femaleStyles;
  const randomStyle = clothingStyles[Math.floor(Math.random() * clothingStyles.length)];
  
  let prompt = `
    Using the person in the provided image, create a high-end professional fashion studio portrait. 
    Keep their face and identity exactly as they are, but enhance the lighting for a professional model look. 
    Change their clothing to ${randomStyle}.
    The top part of the outfit should be ${top.name} (${top.hex}) and the bottom part should be ${bottom.name} (${bottom.hex}).
  `;

  if (hijab) {
    prompt += `The person is wearing a high-fashion hijab, and the hijab color should be ${hijab.name} (${hijab.hex}). It should be styled in a modern, professional, and extremely elegant way, matching the high-fashion editorial vibe. `;
  } else if (result.gender === 'male') {
    prompt += `The person's hair should be visible and styled in a sharp, clean, professional masculine haircut, looking like a male fashion model. `;
  } else {
    prompt += `The person's hair should be visible and styled in a professional, high-fashion manner. `;
  }

  prompt += `
    The person should have a confident, cool, and professional model pose.
    The person should be perfectly centered in the frame, with enough space above their head to ensure it is not cut off. 
    The composition should be a professional medium-full shot, showing the complete outfit clearly.
    The background should be a PURE WHITE professional studio background with clean, soft, high-end studio lighting. 
    The style is high-end fashion editorial photography, professional, sharp, and well-composed.
    IMPORTANT: DO NOT include any text, labels, or watermarks in the image.
  `;

  const response = await ai.models.generateContent({
    model: imageModel,
    contents: {
      parts: [
        {
          inlineData: {
            data: originalImage.split(",")[1],
            mimeType: "image/jpeg",
          },
        },
        { text: prompt },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "3:4",
      }
    }
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("Failed to generate image");
}
