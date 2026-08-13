import { ai } from "../config/ai.config";

export const analyzeReceiptFile = async (
  fileBuffer: Buffer,
  mimeType: string
) => {
  try {
    const base64Image = fileBuffer.toString("base64");
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

const prompt = `
You are a professional receipt and invoice data extraction AI.

Analyze the provided receipt or invoice image carefully and extract only the information that is clearly visible in the document.

Your task is to identify and return structured expense data.

IMPORTANT RULES:
1. Do not guess, invent, or hallucinate any information.
2. Only extract information that is clearly readable or confidently identifiable from the document.
3. If a field cannot be found or is unreadable, return null.
4. Preserve the exact meaning of the information from the document.
5. Extract the final total amount, not a subtotal, tax amount, discount, or individual item price.
6. If multiple totals are visible, choose the final amount actually payable by the customer.
7. Convert the date into ISO format (YYYY-MM-DD) whenever the date can be determined confidently.
8. Return the numeric totalAmount as a number, never as a string.
9. Do not include currency symbols inside totalAmount.
10. Determine the expense category based only on clear evidence from the vendor or document.
11. If the category cannot be determined confidently, use "other".
12. Determine the payment method only when it is explicitly shown on the document. Otherwise use "other".
13. Do not add explanations, comments, markdown, or extra text.
14. Your entire response must be valid JSON.

RETURN EXACTLY THIS JSON STRUCTURE:

{
  "vendorName": null,
  "date": null,
  "totalAmount": null,
  "customerName": null,
  "accountOrSQN": null,
  "category": "other",
  "paymentMethod": "other"
}

ALLOWED CATEGORY VALUES:
- rent
- salaries
- utilities
- marketing
- supplies
- equipment
- maintenance
- taxes
- other

ALLOWED PAYMENT METHOD VALUES:
- cash
- bank_transfer
- mobile_money
- credit_card
- cheque
- other

FIELD DEFINITIONS:

vendorName:
The name of the company, business, store, utility provider, or merchant that issued the receipt/invoice.

date:
The transaction or invoice date. Return it as YYYY-MM-DD.

totalAmount:
The final amount payable by the customer. Return only the numeric value.

customerName:
The customer's name if explicitly shown.

accountOrSQN:
The account number, SQN number, meter number, customer number, invoice number, serial number, or other relevant reference number if clearly shown.

category:
Classify the expense using the allowed category values. Use "utilities" for electricity, water, internet, gas, or similar utility bills. Use "other" when classification is uncertain.

paymentMethod:
The payment method explicitly indicated on the document. If it is not shown, use "other".

FINAL REQUIREMENT:
Return ONLY valid JSON matching the exact structure above.
`;


    const response = await ai.chat.completions.create({
      model: "qwen/qwen2.5-vl-72b-instruct",

      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
            {
              type: "image_url",
              image_url: {
                url: dataUrl,
              },
            },
          ],
        },
      ],

      response_format: {
        type: "json_object",
      },
    });

    const textResult = response.choices[0]?.message?.content;

    if (!textResult) {
      throw new Error("AI-gu wax xog ah kama soo saarin faylkan.");
    }

    return JSON.parse(textResult);
  } catch (error: any) {
    console.error("AI ERROR:", error);

    throw new Error(
      "AI-gu wuu ku guuldaraystay inuu akhriyo rasiidhkan. Fadlan dib u tijaabi."
    );
  }
};