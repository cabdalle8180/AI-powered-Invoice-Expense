// import { Response } from "express";
// import mongoose from "mongoose";
// import Business, { IBusiness } from "../models/Business";
// import User from "../models/user";
// import { AuthRequest } from "../middleware/auth.middleware";

// // HELPERS

// const isNonEmptyString = (val: unknown): val is string => {
//   return typeof val === "string" && val.trim().length > 0;
// };

// const isValidObjectId = (id: unknown): id is string => {
//   return typeof id === "string" && mongoose.Types.ObjectId.isValid(id);
// };

// // BUSINESS CONTROLLERS

// /**
//  * @route   POST /api/businesses
//  * @desc    Create a new business & set the creator as owner
//  * @access  Private
//  */
// export const createBusiness = async (
//   req: AuthRequest,
//   res: Response
// ): Promise<void> => {
//   try {
//     const { name, email, phone, address, currency, taxNumber, logo } = req.body;
//     const userId = req.user?.userId;

//     if (!userId) {
//       res.status(401).json({ success: false, message: "Authentication required" });
//       return;
//     }

//     if (!isNonEmptyString(name) || !isNonEmptyString(email)) {
//       res.status(400).json({
//         success: false,
//         message: "Business name and email are required",
//       });
//       return;
//     }

//     // Create the business
//     const business = await Business.create({
//       name: name.trim(),
//       email: email.trim().toLowerCase(),
//       phone: isNonEmptyString(phone) ? phone.trim() : undefined,
//       address: isNonEmptyString(address) ? address.trim() : undefined,
//       currency: isNonEmptyString(currency) ? currency.trim().toUpperCase() : "USD",
//       taxNumber: isNonEmptyString(taxNumber) ? taxNumber.trim() : undefined,
//       logo,
//       ownerId: new mongoose.Types.ObjectId(userId),
//       isActive: true,
//     });

//     // Update the user who created it to be the "owner" and link the businessId
//     // (Unless they are a superAdmin, in which case we don't downgrade their role)
//     const userUpdate: any = { businessId: business._id };
//     if (req.user?.role !== "superAdmin") {
//       userUpdate.role = "owner";
//     }

//     await User.findByIdAndUpdate(userId, { $set: userUpdate });

//     res.status(201).json({
//       success: true,
//       message: "Business created successfully",
//       data: { business },
//     });
//   } catch (error) {
//     console.error("CreateBusiness error:", error);
//     res.status(500).json({ success: false, message: "Internal server error" });
//   }
// };






import { Response } from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs"; // Hubi inaad import garayso bcrypt
import Business, { IBusiness } from "../models/Business";
import User from "../models/user";
import { AuthRequest } from "../middleware/auth.middleware";

// HELPERS
const isNonEmptyString = (val: unknown): val is string => {
  return typeof val === "string" && val.trim().length > 0;
};

const isValidObjectId = (id: unknown): id is string => {
  return typeof id === "string" && mongoose.Types.ObjectId.isValid(id);
};

/**
 * @route   POST /api/businesses
 * @desc    Create a new business and its owner at the same time
 * @access  Private (SuperAdmin)
 */
// export const createBusiness = async (
//   req: AuthRequest,
//   res: Response
// ): Promise<void> => {
//   try {
//     // 1. Soo qaado xogta Ganacsiga iyo mida Milkiilaha oo kala soocan
//     const { 
//       businessName, businessEmail, phone, address, currency, taxNumber, logo, 
//       ownerName, ownerEmail, ownerPassword, ownerPhone 
//     } = req.body;

//     const userId = req.user?.userId;

//     if (!userId) {
//       res.status(401).json({ success: false, message: "Authentication required" });
//       return;
//     }

//     // 2. Hubi Xogta Ganacsiga
//     if (!isNonEmptyString(businessName) || !isNonEmptyString(businessEmail)) {
//       res.status(400).json({ success: false, message: "Business name and email are required" });
//       return;
//     }

//     // 3. Hubi Xogta Milkiilaha (Owner)
//     if (!isNonEmptyString(ownerName) || !isNonEmptyString(ownerEmail) || !isNonEmptyString(ownerPassword)) {
//       res.status(400).json({ success: false, message: "Owner name, email, and password are required" });
//       return;
//     }

//     // 4. Hubi in Email-ka milkiilaha uusan horay nidaamka ugu jirin (Si error looga fogaado)
//     const existingUser = await User.findOne({ email: ownerEmail.trim().toLowerCase() });
//     if (existingUser) {
//       res.status(409).json({ success: false, message: "Owner email already exists in the system" });
//       return;
//     }

//     // 5. Abuur Ganacsiga (Bilaa ownerId marka hore)
//     const business = await Business.create({
//       name: businessName.trim(),
//       email: businessEmail.trim().toLowerCase(),
//       phone: isNonEmptyString(phone) ? phone.trim() : undefined,
//       address: isNonEmptyString(address) ? address.trim() : undefined,
//       currency: isNonEmptyString(currency) ? currency.trim().toUpperCase() : "USD",
//       taxNumber: isNonEmptyString(taxNumber) ? taxNumber.trim() : undefined,
//       logo,
//       isActive: true,
//     });

//     // 6. Sifee (Hash) Password-ka milkiilaha cusub
//     const hashedPassword = await bcrypt.hash(ownerPassword, 10);

//     // 7. Abuur Milkiilaha (Owner) oo ku xir Business ID-ga ganacsiga la abuuray
//     const owner = await User.create({
//       name: ownerName.trim(),
//       email: ownerEmail.trim().toLowerCase(),
//       password: hashedPassword,
//       phone: isNonEmptyString(ownerPhone) ? ownerPhone.trim() : undefined,
//       role: "owner", // Si toos ah Owner uga dhig
//       businessId: business._id,
//       isActive: true,
//     });

//     // 8. Ganacsiga dib ugu Update garee ID-ga Milkiilaha la abuuray
//     business.ownerId = owner._id as mongoose.Types.ObjectId;
//     await business.save();

//     // 9. Soo celi Jawaab guul ah
//     res.status(201).json({
//       success: true,
//       message: "Business and Owner created successfully",
//       data: { 
//         business,
//         owner: {
//           id: owner._id,
//           name: owner.name,
//           email: owner.email,
//           role: owner.role
//         }
//       },
//     });
//   } catch (error) {
//     console.error("CreateBusiness error:", error);
//     res.status(500).json({ success: false, message: "Internal server error" });
//   }
// };

export const createBusiness = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { 
      businessName, businessEmail, phone, address, currency, taxNumber, logo, 
      ownerName, ownerEmail, ownerPassword, ownerPhone 
    } = req.body;

    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    // 1. Hubi Xogta Ganacsiga
    if (!isNonEmptyString(businessName) || !isNonEmptyString(businessEmail)) {
      res.status(400).json({ success: false, message: "Business name and email are required" });
      return;
    }

    // 2. Hubi Xogta Milkiilaha
    if (!isNonEmptyString(ownerName) || !isNonEmptyString(ownerEmail) || !isNonEmptyString(ownerPassword)) {
      res.status(400).json({ success: false, message: "Owner name, email, and password are required" });
      return;
    }

    // 3. Hubi in Email-ka milkiilaha uusan horay nidaamka ugu jirin
    const existingUser = await User.findOne({ email: ownerEmail.trim().toLowerCase() });
    if (existingUser) {
      res.status(409).json({ success: false, message: "Owner email already exists in the system" });
      return;
    }

    // 4. Hash-garee Password-ka
    const hashedPassword = await bcrypt.hash(ownerPassword, 10);

    // 5. Abuur Milkiilaha (User) HOREYN si aan u helno ID-giisa
    const owner = await User.create({
      name: ownerName.trim(),
      email: ownerEmail.trim().toLowerCase(),
      password: hashedPassword,
      phone: isNonEmptyString(ownerPhone) ? ownerPhone.trim() : undefined,
      role: "owner",
      isActive: true,
    });

    // 6. Abuur Ganacsiga isaga oo wata 'ownerId' maadaama ay required tahay
    const business = await Business.create({
      name: businessName.trim(),
      email: businessEmail.trim().toLowerCase(),
      phone: isNonEmptyString(phone) ? phone.trim() : undefined,
      address: isNonEmptyString(address) ? address.trim() : undefined,
      currency: isNonEmptyString(currency) ? currency.trim().toUpperCase() : "USD",
      taxNumber: isNonEmptyString(taxNumber) ? taxNumber.trim() : undefined,
      logo,
      ownerId: owner._id, // Halkan ayaa lagu bixiyay ownerId
      isActive: true,
    });

    // 7. Dib ugu cusboonaysii Milkiilaha ID-ga Business-ka cusub
    owner.businessId = business._id as mongoose.Types.ObjectId;
    await owner.save();

    res.status(201).json({
      success: true,
      message: "Business and Owner created successfully",
      data: { 
        business,
        owner: {
          id: owner._id,
          name: owner.name,
          email: owner.email,
          role: owner.role
        }
      },
    });
  } catch (error) {
    console.error("CreateBusiness error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


/**
 * @route   GET /api/businesses
 * @desc    Get businesses (SuperAdmin gets paginated list, others get their own)
 * @access  Private (SuperAdmin / Owner / Accountant)
 */
export const getBusinesses = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const role = req.user?.role;

    // Non-superAdmins can only see their own business
    if (role !== "superAdmin") {
      if (!req.user?.businessId) {
        res.status(404).json({ success: false, message: "No business associated with this user" });
        return;
      }
      
      const business = await Business.findById(req.user.businessId);
      res.status(200).json({
        success: true,
        data: { businesses: business ? [business] : [] },
      });
      return;
    }

    // SuperAdmin Logic: Fetch all businesses with pagination & filtering
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 10));
    const skip = (page - 1) * limit;

    const { search, isActive } = req.query;
    const filter: Record<string, any> = {};

    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    if (isNonEmptyString(search as string)) {
      const searchRegex = new RegExp((search as string).trim(), "i");
      filter.$or = [{ name: searchRegex }, { email: searchRegex }, { taxNumber: searchRegex }];
    }

    const [businesses, total] = await Promise.all([
      Business.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate("ownerId", "name email"),
      Business.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        businesses,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("GetBusinesses error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * @route   GET /api/businesses/:id
 * @desc    Get single business by ID
 * @access  Private (SuperAdmin / Owner / Accountant)
 */
export const getBusinessById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      res.status(400).json({ success: false, message: "Invalid business ID" });
      return;
    }

    // Multi-tenant check
    if (req.user?.role !== "superAdmin" && req.user?.businessId !== id) {
      res.status(403).json({ success: false, message: "Permission denied to access this business" });
      return;
    }

    const business = await Business.findById(id).populate("ownerId", "name email phone");

    if (!business) {
      res.status(404).json({ success: false, message: "Business not found" });
      return;
    }

    res.status(200).json({
      success: true,
      data: { business },
    });
  } catch (error) {
    console.error("GetBusinessById error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * @route   PUT /api/businesses/:id
 * @desc    Update business details
 * @access  Private (SuperAdmin / Owner)
 */
export const updateBusiness = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, phone, address, currency, taxNumber, logo } = req.body;

    if (!isValidObjectId(id)) {
      res.status(400).json({ success: false, message: "Invalid business ID" });
      return;
    }

    // Multi-tenant check
    if (req.user?.role !== "superAdmin" && req.user?.businessId !== id) {
      res.status(403).json({ success: false, message: "Permission denied to update this business" });
      return;
    }

    const updates: Partial<IBusiness> = {};

    if (isNonEmptyString(name)) updates.name = name.trim();
    if (isNonEmptyString(email)) updates.email = email.trim().toLowerCase();
    if (phone !== undefined) updates.phone = isNonEmptyString(phone) ? phone.trim() : undefined;
    if (address !== undefined) updates.address = isNonEmptyString(address) ? address.trim() : undefined;
    if (isNonEmptyString(currency)) updates.currency = currency.trim().toUpperCase();
    if (taxNumber !== undefined) updates.taxNumber = isNonEmptyString(taxNumber) ? taxNumber.trim() : undefined;
    if (logo) updates.logo = logo;

    const updatedBusiness = await Business.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedBusiness) {
      res.status(404).json({ success: false, message: "Business not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Business updated successfully",
      data: { business: updatedBusiness },
    });
  } catch (error) {
    console.error("UpdateBusiness error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * @route   PATCH /api/businesses/:id/status
 * @desc    Toggle business active/deactive status (Deactivating a business pauses access)
 * @access  Private (SuperAdmin)
 */
export const toggleBusinessStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!isValidObjectId(id)) {
      res.status(400).json({ success: false, message: "Invalid business ID" });
      return;
    }

    if (typeof isActive !== "boolean") {
      res.status(400).json({ success: false, message: "isActive field must be a boolean" });
      return;
    }

    const business = await Business.findById(id);
    if (!business) {
      res.status(404).json({ success: false, message: "Business not found" });
      return;
    }

    business.isActive = isActive;
    await business.save();

    res.status(200).json({
      success: true,
      message: `Business status changed to ${isActive ? "active" : "inactive"}`,
      data: { business },
    });
  } catch (error) {
    console.error("ToggleBusinessStatus error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};