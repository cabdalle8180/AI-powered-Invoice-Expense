"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCustomerSelfFilter = exports.buildBusinessFilter = exports.getCustomerRecordForUser = exports.isValidObjectId = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Customer_1 = __importDefault(require("../models/Customer"));
const roles_1 = require("../constants/roles");
const isValidObjectId = (id) => typeof id === "string" && mongoose_1.default.Types.ObjectId.isValid(id);
exports.isValidObjectId = isValidObjectId;
const getCustomerRecordForUser = async (req) => {
    if (!req.user?.userId || !req.user.businessId) {
        return null;
    }
    if ((0, roles_1.normalizeRole)(req.user.role) !== "customer") {
        return null;
    }
    if (req.user.customerId) {
        return { _id: new mongoose_1.default.Types.ObjectId(req.user.customerId) };
    }
    return Customer_1.default.findOne({
        businessId: req.user.businessId,
        userId: req.user.userId,
        isActive: true,
    }).select("_id");
};
exports.getCustomerRecordForUser = getCustomerRecordForUser;
const buildBusinessFilter = (req) => {
    if (!req.user?.businessId) {
        return null;
    }
    return { businessId: req.user.businessId };
};
exports.buildBusinessFilter = buildBusinessFilter;
const buildCustomerSelfFilter = (req) => {
    const businessFilter = (0, exports.buildBusinessFilter)(req);
    if (!businessFilter) {
        return null;
    }
    if ((0, roles_1.normalizeRole)(req.user?.role || "") !== "customer") {
        return businessFilter;
    }
    if (!req.user?.customerId) {
        return null;
    }
    return {
        ...businessFilter,
        customerId: req.user.customerId,
    };
};
exports.buildCustomerSelfFilter = buildCustomerSelfFilter;
