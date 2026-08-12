import { genAI } from "../config/ai.config";

export interface ExtractedReceiptData {
  vendor: string;
  amount: number;
  date: string;
  category:
    | "rent"
    | "salaries"
    | "utilities"
    | "marketing"
    | "supplies"
    | "equipment"
    | "maintenance"
    | "taxes"
    | "other";
}

const allowedCategories = [
  "rent",
  "salaries",
  "utilities",
  "marketing",
  "supplies",
  "equipment",
  "maintenance",
  "taxes",
  "other",
] as const;

export const analyzeReceiptFile = async (
  fileBuffer: Buffer,
  mimeType: string
): Promise<ExtractedReceiptData> => {
  try {
    const prompt = `
Analyze this receipt or invoice.

Return ONLY valid JSON:

{
  "vendor": "Business/vendor name",
  "amount": 0,
  "date": "YYYY-MM-DD",
  "category": "other"
}

Rules:
- vendor must be the business/vendor name.
- If vendor is not visible, use "Unknown".
- amount must be the final total as a number.
- Do not include currency symbols in amount.
- date must use YYYY-MM-DD.
- If date is not visible, use an empty string.
- category must be exactly one of:
  rent, salaries, utilities, marketing, supplies,
  equipment, maintenance, taxes, other
- Do not add any other fields.
`;

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: prompt,
            },
            {
              inlineData: {
                mimeType,
                data: fileBuffer.toString("base64"),
              },
            },
          ],
        },
      ],
      config: {
        temperature: 0,
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text?.trim();

    if (!responseText) {
      throw new Error("Gemini returned an empty response");
    }

    const data = JSON.parse(responseText) as ExtractedReceiptData;

    if (typeof data.vendor !== "string") {
      throw new Error("Invalid vendor");
    }

    if (
      typeof data.amount !== "number" ||
      !Number.isFinite(data.amount)
    ) {
      throw new Error("Invalid amount");
    }

    if (typeof data.date !== "string") {
      throw new Error("Invalid date");
    }

    if (!allowedCategories.includes(data.category)) {
      data.category = "other";
    }

    return data;
  } catch (error) {
    console.error("=================================");
    console.error("GEMINI AI ERROR:");
    console.error(error);
    console.error("=================================");

    throw new Error(
      "AI-gu wuu ku guuldaraystay inuu akhriyo rasiidhkan. Fadlan dib u tijaabi."
    );
  }
};


