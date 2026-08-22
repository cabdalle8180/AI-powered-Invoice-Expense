import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Settings,
  LogOut,
  User as UserIcon,
  Building2,
  Upload,
  Trash2,
  KeyRound,
  Loader2,
  Camera,
  Image as ImageIcon,
} from "lucide-react";
import { useAppDispatch } from "../hooks/reduxHooks";
import { logout, verifySession } from "../features/auth/authSlice";
import { usePermission } from "../hooks/usePermission";
import {
  uploadAvatar,
  deleteAvatar,
  uploadBusinessLogo,
  updateMe,
  updatePassword,
} from "../api/userService";

export const SettingsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, role, isOwner, isSuperAdmin } = usePermission();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Profile update form
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Avatar upload
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isDeletingAvatar, setIsDeletingAvatar] = useState(false);

  // Logo upload
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // Password update form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  // Avatar Upload Handler
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Avatar image must be smaller than 5MB");
      return;
    }

    // Validate format
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (JPG, PNG, WEBP)");
      return;
    }

    try {
      setIsUploadingAvatar(true);
      await uploadAvatar(file);
      await dispatch(verifySession()).unwrap();
      toast.success("Profile avatar updated successfully!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to upload avatar");
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Avatar Delete Handler
  const handleDeleteAvatar = async () => {
    try {
      setIsDeletingAvatar(true);
      await deleteAvatar();
      await dispatch(verifySession()).unwrap();
      toast.success("Avatar removed successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to remove avatar");
    } finally {
      setIsDeletingAvatar(false);
    }
  };

  // Business Logo Upload Handler
  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!user?.businessId) {
      toast.error("No associated business ID found");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Logo must be smaller than 5MB");
      return;
    }

    try {
      setIsUploadingLogo(true);
      await uploadBusinessLogo(user.businessId, file);
      toast.success("Business logo updated successfully!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to upload business logo");
    } finally {
      setIsUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  };

  // Profile Save Handler
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    try {
      setIsSavingProfile(true);
      await updateMe({ name, phone });
      await dispatch(verifySession()).unwrap();
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Password Save Handler
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      setIsSavingPassword(true);
      await updatePassword({ currentPassword, newPassword });
      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to change password");
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-16">
      <main className="px-4 sm:px-8 py-8 max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2.5">
            <Settings size={28} className="text-sky-500" /> Account Settings
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your personal profile, security credentials, and organization branding.
          </p>
        </div>

        {/* ─── 1. AVATAR & IDENTITY SECTION ─────────────────────────────── */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <UserIcon size={18} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">User Profile & Avatar</h3>
              <p className="text-xs text-gray-400">Cloud-synced avatar and contact details</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar Preview */}
            <div className="relative group">
              {user?.avatar?.url ? (
                <img
                  src={user.avatar.url}
                  alt="Avatar"
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-sky-100 shadow-xs"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-sky-500 to-cyan-400 text-white flex items-center justify-center font-bold text-3xl shadow-xs">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
              )}

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute -bottom-2 -right-2 p-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl shadow-md transition-all cursor-pointer"
                title="Change Avatar"
              >
                {isUploadingAvatar ? <Loader2 size={15} className="animate-spin" /> : <Camera size={15} />}
              </button>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
            />

            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
                >
                  <Upload size={14} /> Upload New Photo
                </button>
                {user?.avatar?.url && (
                  <button
                    type="button"
                    onClick={handleDeleteAvatar}
                    disabled={isDeletingAvatar}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold rounded-xl transition cursor-pointer disabled:opacity-50"
                  >
                    {isDeletingAvatar ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} Remove
                  </button>
                )}
              </div>
              <p className="text-[11px] text-gray-400">
                Recommended: Square JPG, PNG, or WEBP under 5MB. Uploads securely to Cloudinary.
              </p>
            </div>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleProfileSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full border border-gray-100 bg-gray-50 text-gray-500 rounded-xl px-3.5 py-2 text-sm cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Assigned Role</label>
              <input
                type="text"
                value={role ? role.toUpperCase() : "USER"}
                disabled
                className="w-full border border-gray-100 bg-gray-50 text-gray-500 font-semibold rounded-xl px-3.5 py-2 text-sm cursor-not-allowed"
              />
            </div>

            <div className="sm:col-span-2 flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-5 py-2.5 rounded-xl text-xs sm:text-sm shadow-xs transition disabled:opacity-50 cursor-pointer"
              >
                {isSavingProfile && <Loader2 size={14} className="animate-spin" />}
                Save Changes
              </button>
            </div>
          </form>
        </div>

        {/* ─── 2. BUSINESS BRANDING LOGO (For Owners / SuperAdmin) ───────── */}
        {(isOwner || isSuperAdmin) && user?.businessId && (
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Building2 size={18} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">Business Branding & Logo</h3>
                <p className="text-xs text-gray-400">Your logo appears on invoices and client receipts</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="w-20 h-20 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center text-gray-400 shrink-0">
                <ImageIcon size={28} />
              </div>

              <input
                type="file"
                ref={logoInputRef}
                onChange={handleLogoChange}
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
              />

              <div className="space-y-2 text-center sm:text-left">
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={isUploadingLogo}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50"
                >
                  {isUploadingLogo ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  Upload Business Logo
                </button>
                <p className="text-[11px] text-gray-400">
                  Upload a high-resolution logo (PNG, JPG, WEBP). Stored securely on Cloudinary.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ─── 3. SECURITY & PASSWORD UPDATE ─────────────────────────────── */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <KeyRound size={18} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Security & Password</h3>
              <p className="text-xs text-gray-400">Ensure your account uses a strong 8+ character password</p>
            </div>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={8}
                required
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={8}
                required
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-100"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSavingPassword}
                className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-5 py-2.5 rounded-xl text-xs sm:text-sm shadow-xs transition disabled:opacity-50 cursor-pointer"
              >
                {isSavingPassword && <Loader2 size={14} className="animate-spin" />}
                Update Password
              </button>
            </div>
          </form>
        </div>

        {/* ─── 4. LOGOUT & SESSION ───────────────────────────────────────── */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs flex items-center justify-between">
          <div>
            <h4 className="font-bold text-gray-900 text-sm">Account Session</h4>
            <p className="text-xs text-gray-400 mt-0.5">End your current session across this device</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold text-xs rounded-xl transition cursor-pointer"
          >
            <LogOut size={15} /> Terminate Session
          </button>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
