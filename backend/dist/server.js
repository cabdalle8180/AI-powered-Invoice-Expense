"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const dotenv_1 = __importDefault(require("dotenv"));
const dbs_1 = __importDefault(require("./config/dbs"));
dotenv_1.default.config();
const PORT = process.env.PORT || 4000;
(0, dbs_1.default)();
app_1.default.listen(PORT, () => {
    console.log(`Server is running on port http://localhost:${PORT}`);
});
