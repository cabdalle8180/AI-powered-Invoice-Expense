import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { analyzeReceiptFile } from "../service/ai.service";

export const extractExpenseData = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    const file = req.file;

    // ==========================================
    // AUTH CHECK
    // ==========================================

    if (!businessId) {
      res.status(403).json({
        success: false,
        message: "Business lama helin ama ma lihid oggolaansho.",
      });
      return;
    }

    // ==========================================
    // FILE CHECK
    // ==========================================

    if (!file) {
      res.status(400).json({
        success: false,
        message:
          "Fadlan soo geli receipt ama invoice (JPG, PNG, WEBP ama PDF).",
      });
      return;
    }

    // ==========================================
    // AI ANALYSIS
    // ==========================================

    const extractedData = await analyzeReceiptFile(
      file.buffer,
      file.mimetype
    );

    // ==========================================
    // RESPONSE
    // ==========================================

    res.status(200).json({
      success: true,
      message: "Xogta receipt-ka si guul leh ayaa looga soo saaray.",
      data: extractedData,
    });
  } catch (error: any) {
    console.error("AI Controller Error:", error);

    res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Waxaa dhacay cilad intii AI-gu shaqaynayay.",
    });
  }
};