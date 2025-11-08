
import { GoogleGenAI, Type } from "@google/genai";
import { BlueprintSection, SpotlightSuggestion } from '../types';

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. Using a placeholder. Please set your API key for the app to function.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "YOUR_API_KEY_HERE" });

const model = 'gemini-2.5-flash';

const getContext = (brainDump: string, docs: { name: string, content: string }[]): string => {
  const docsContent = docs.map(d => `--- DOC: ${d.name} ---\n${d.content}`).join('\n\n');
  return `BRAIN DUMP:\n${brainDump}\n\nDOCUMENTATION CONTEXT:\n${docsContent}`;
};

export const generateSections = async (brainDump: string, docs: { name: string, content: string }[]): Promise<string[]> => {
  try {
    const context = getContext(brainDump, docs);
    const prompt = `Based on the provided context, break down the product idea into high-level sections for a product backlog.
    Each section should represent a major feature area or component.
    Your response must not contain any placeholders.
    Context:\n${context}`;
    
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sections: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "An array of high-level section titles for the product blueprint."
            }
          }
        },
        systemInstruction: "You are a product manager AI. Your task is to structure product ideas into actionable backlogs without any placeholders."
      },
    });

    const jsonResponse = JSON.parse(response.text);
    return jsonResponse.sections || [];
  } catch (error) {
    console.error("Error generating sections:", error);
    throw new Error("Failed to generate blueprint sections.");
  }
};

export const generateBacklogTitles = async (brainDump: string, docs: { name: string, content: string }[], sections: string[]): Promise<Record<string, string[]>> => {
  try {
    const context = getContext(brainDump, docs);
    const prompt = `Based on the context and the following sections, generate descriptive backlog item titles for each section.
    These titles should represent specific tasks or user stories.
    Your response must not contain any placeholders.
    Context:\n${context}\n\nSECTIONS:\n${sections.join(', ')}`;
    
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            backlog: {
              type: Type.OBJECT,
              properties: sections.reduce((acc, section) => {
                acc[section] = {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: `Backlog titles for the '${section}' section.`
                };
                return acc;
              }, {} as Record<string, any>)
            }
          }
        },
        systemInstruction: "You are a product manager AI. Your task is to create backlog item titles without any placeholders."
      },
    });

    const jsonResponse = JSON.parse(response.text);
    return jsonResponse.backlog || {};
  } catch (error) {
    console.error("Error generating backlog titles:", error);
    throw new Error("Failed to generate backlog titles.");
  }
};


export const generateBacklogDetails = async (brainDump: string, docs: { name: string, content: string }[], sectionWithTitles: { title: string, backlog: { id: string, title: string }[] }): Promise<Record<string, string>> => {
    try {
        const context = getContext(brainDump, docs);
        const titles = sectionWithTitles.backlog.map(b => b.title);
        const prompt = `For the section "${sectionWithTitles.title}", generate a detailed description for each of the following backlog items.
        Each description should be a concise paragraph (2-4 sentences) outlining the task, its goal, and acceptance criteria.
        Your response must not contain any placeholders.
        Context:\n${context}\n\nBACKLOG TITLES:\n${titles.join('\n- ')}`;

        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        details: {
                            type: Type.OBJECT,
                            properties: titles.reduce((acc, title) => {
                                acc[title] = {
                                    type: Type.STRING,
                                    description: `Detailed description for the backlog item: '${title}'.`
                                };
                                return acc;
                            }, {} as Record<string, any>)
                        }
                    }
                },
                systemInstruction: "You are a senior software engineer AI. Your task is to write detailed, placeholder-free specifications for backlog items."
            },
        });
        const jsonResponse = JSON.parse(response.text);
        return jsonResponse.details || {};
    } catch (error) {
        console.error(`Error generating details for section "${sectionWithTitles.title}":`, error);
        throw new Error(`Failed to generate details for section "${sectionWithTitles.title}".`);
    }
};

export const generateFeatureSuggestions = async (brainDump: string): Promise<SpotlightSuggestion[]> => {
  try {
      const prompt = `Based on the following product idea, suggest 1-2 innovative and relevant new features.
      For each feature, provide a catchy name and a short description.
      Your response must not contain any placeholders.
      Product Idea:\n${brainDump}`;

      const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
              responseMimeType: "application/json",
              responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                      suggestions: {
                          type: Type.ARRAY,
                          items: {
                              type: Type.OBJECT,
                              properties: {
                                  featureName: { type: Type.STRING },
                                  description: { type: Type.STRING }
                              },
                              required: ["featureName", "description"]
                          }
                      }
                  }
              },
              systemInstruction: "You are a creative product strategist AI. Your task is to brainstorm novel features."
          },
      });
      const jsonResponse = JSON.parse(response.text);
      return jsonResponse.suggestions || [];
  } catch (error) {
      console.error("Error generating feature suggestions:", error);
      // Return an empty array on failure to not break the UI
      return [];
  }
};
