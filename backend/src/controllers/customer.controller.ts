import { Response } from "express";
import mongoose from "mongoose";
import Customer, { ICustomer } from "../models/Customer";
import User from "../models/user";
import { AuthRequest } from "../middleware/auth.middleware";

// HELPERS

const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === "string" && value.trim().length > 0;
};

const isValidObjectId = (id: unknown): id is string => {
  return (
    typeof id === "string" &&
    mongoose.Types.ObjectId.isValid(id)
  );
};

const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// CREATE CUSTOMER
// POST /api/customers

export const createCustomer = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    const userId = req.user?.userId;

    if (!businessId) {
      res.status(403).json({
        success: false,
        message: "No business associated with this user",
      });
      return;
    }

    const {
      name,
      email,
      phone,
      address,
      companyName,
      taxNumber,
      userId: customerUserId,
    } = req.body;

    // ----------------------------------------------
    // Required fields
    // ----------------------------------------------

    if (!isNonEmptyString(name)) {
      res.status(400).json({
        success: false,
        message: "Customer name is required",
      });
      return;
    }

    if (!isNonEmptyString(email)) {
      res.status(400).json({
        success: false,
        message: "Customer email is required",
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      res.status(400).json({
        success: false,
        message: "Invalid email address",
      });
      return;
    }

    // ----------------------------------------------
    // Check duplicate customer in same business
    // ----------------------------------------------

    const existingCustomer = await Customer.findOne({
      businessId,
      email: normalizedEmail,
    });

    if (existingCustomer) {
      res.status(409).json({
        success: false,
        message: "Customer with this email already exists",
      });
      return;
    }

    // ----------------------------------------------
    // Optional User validation
    // ----------------------------------------------

    let validUserId: mongoose.Types.ObjectId | undefined;

    if (customerUserId !== undefined) {
      if (!isValidObjectId(customerUserId)) {
        res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
        return;
      }

      const user = await User.findOne({
        _id: customerUserId,
        businessId,
        role: "customer",
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message:
            "Customer user not found or does not belong to this business",
        });
        return;
      }

      validUserId = new mongoose.Types.ObjectId(customerUserId);
    }

    // ----------------------------------------------
    // Create customer
    // ----------------------------------------------

    const customer = await Customer.create({
      businessId,
      userId: validUserId,

      name: name.trim(),
      email: normalizedEmail,

      phone: isNonEmptyString(phone)
        ? phone.trim()
        : undefined,

      address: isNonEmptyString(address)
        ? address.trim()
        : undefined,

      companyName: isNonEmptyString(companyName)
        ? companyName.trim()
        : undefined,

      taxNumber: isNonEmptyString(taxNumber)
        ? taxNumber.trim()
        : undefined,

      totalInvoiced: 0,
      totalPaid: 0,
      outstandingBalance: 0,

      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: {
        customer,
      },
    });
  } catch (error) {
    console.error("CreateCustomer error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// GET ALL CUSTOMERS
// GET /api/customers

export const getCustomers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const businessId = req.user?.businessId;

    if (!businessId) {
      res.status(403).json({
        success: false,
        message: "No business associated with this user",
      });
      return;
    }

    // ----------------------------------------------
    // Pagination
    // ----------------------------------------------

    const page = Math.max(
      1,
      parseInt(req.query.page as string, 10) || 1
    );

    const limit = Math.min(
      100,
      Math.max(
        1,
        parseInt(req.query.limit as string, 10) || 10
      )
    );

    const skip = (page - 1) * limit;

    // ----------------------------------------------
    // Query
    // ----------------------------------------------

    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : "";

    const isActive = req.query.isActive;

    const filter: Record<string, unknown> = {
      businessId,
    };

    // Active filter
    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    // Search
    if (search) {
      const searchRegex = new RegExp(search, "i");

      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { companyName: searchRegex },
        { taxNumber: searchRegex },
      ];
    }

    const [customers, total] = await Promise.all([
      Customer.find(filter)
        .populate("userId", "name email phone role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Customer.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        customers,

        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("GetCustomers error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// GET CUSTOMER BY ID
// GET /api/customers/:id

export const getCustomerById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    const { id } = req.params;

    if (!businessId) {
      res.status(403).json({
        success: false,
        message: "No business associated with this user",
      });
      return;
    }

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
      return;
    }

    const customer = await Customer.findOne({
      _id: id,
      businessId,
    }).populate(
      "userId",
      "name email phone role"
    );

    if (!customer) {
      res.status(404).json({
        success: false,
        message: "Customer not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        customer,
      },
    });
  } catch (error) {
    console.error("GetCustomerById error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// UPDATE CUSTOMER
// PUT /api/customers/:id

export const updateCustomer = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    const { id } = req.params;

    if (!businessId) {
      res.status(403).json({
        success: false,
        message: "No business associated with this user",
      });
      return;
    }

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
      return;
    }

    const {
      name,
      email,
      phone,
      address,
      companyName,
      taxNumber,
      isActive,
    } = req.body;

    const customer = await Customer.findOne({
      _id: id,
      businessId,
    });

    if (!customer) {
      res.status(404).json({
        success: false,
        message: "Customer not found",
      });
      return;
    }

    // ----------------------------------------------
    // Name
    // ----------------------------------------------

    if (name !== undefined) {
      if (!isNonEmptyString(name)) {
        res.status(400).json({
          success: false,
          message: "Customer name cannot be empty",
        });
        return;
      }

      customer.name = name.trim();
    }

    // ----------------------------------------------
    // Email
    // ----------------------------------------------

    if (email !== undefined) {
      if (!isNonEmptyString(email)) {
        res.status(400).json({
          success: false,
          message: "Customer email cannot be empty",
        });
        return;
      }

      const normalizedEmail = email.trim().toLowerCase();

      if (!isValidEmail(normalizedEmail)) {
        res.status(400).json({
          success: false,
          message: "Invalid email address",
        });
        return;
      }

      const duplicate = await Customer.findOne({
        businessId,
        email: normalizedEmail,
        _id: { $ne: id },
      });

      if (duplicate) {
        res.status(409).json({
          success: false,
          message:
            "Another customer with this email already exists",
        });
        return;
      }

      customer.email = normalizedEmail;
    }

    // ----------------------------------------------
    // Optional fields
    // ----------------------------------------------

    if (phone !== undefined) {
      customer.phone = isNonEmptyString(phone)
        ? phone.trim()
        : undefined;
    }

    if (address !== undefined) {
      customer.address = isNonEmptyString(address)
        ? address.trim()
        : undefined;
    }

    if (companyName !== undefined) {
      customer.companyName = isNonEmptyString(companyName)
        ? companyName.trim()
        : undefined;
    }

    if (taxNumber !== undefined) {
      customer.taxNumber = isNonEmptyString(taxNumber)
        ? taxNumber.trim()
        : undefined;
    }

    // ----------------------------------------------
    // Active / inactive
    // ----------------------------------------------

    if (isActive !== undefined) {
      if (typeof isActive !== "boolean") {
        res.status(400).json({
          success: false,
          message: "isActive must be a boolean",
        });
        return;
      }

      customer.isActive = isActive;
    }

    await customer.save();

    res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      data: {
        customer,
      },
    });
  } catch (error) {
    console.error("UpdateCustomer error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// DELETE CUSTOMER
// DELETE /api/customers/:id

export const deleteCustomer = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    const { id } = req.params;

    if (!businessId) {
      res.status(403).json({
        success: false,
        message: "No business associated with this user",
      });
      return;
    }

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
      return;
    }

    const customer = await Customer.findOne({
      _id: id,
      businessId,
    });

    if (!customer) {
      res.status(404).json({
        success: false,
        message: "Customer not found",
      });
      return;
    }

    // ----------------------------------------------
    // Soft delete
    // ----------------------------------------------

    customer.isActive = false;

    await customer.save();

    res.status(200).json({
      success: true,
      message: "Customer deactivated successfully",
      data: {
        customer,
      },
    });
  } catch (error) {
    console.error("DeleteCustomer error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// RESTORE CUSTOMER
// PATCH /api/customers/:id/restore

export const restoreCustomer = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const businessId = req.user?.businessId;
    const { id } = req.params;

    if (!businessId) {
      res.status(403).json({
        success: false,
        message: "No business associated with this user",
      });
      return;
    }

    if (!isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
      return;
    }

    const customer = await Customer.findOne({
      _id: id,
      businessId,
    });

    if (!customer) {
      res.status(404).json({
        success: false,
        message: "Customer not found",
      });
      return;
    }

    customer.isActive = true;

    await customer.save();

    res.status(200).json({
      success: true,
      message: "Customer restored successfully",
      data: {
        customer,
      },
    });
  } catch (error) {
    console.error("RestoreCustomer error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
