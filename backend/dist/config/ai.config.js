"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ai = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const openai_1 = __importDefault(require("openai"));
dotenv_1.default.config();
const apiKey = process.env.OPENROUTER_API_KEY;
if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY lagama helin .env");
}
// OpenRouter wuxuu isticmaalaa OpenAI SDK
exports.ai = new openai_1.default({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: apiKey,
});
