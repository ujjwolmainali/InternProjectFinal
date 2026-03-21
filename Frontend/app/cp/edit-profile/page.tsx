"use client";

import React, { useState, useEffect } from "react";
import { Edit2, Save, X } from "lucide-react";
import api from "@/app/lib/axios"; // axios instance
import { toast } from "react-toastify";
import Breadcrumb from "@/app/components/Breadcrum";

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  country: string;
  cityState: string;
  position?: string;
  location?: string;
}

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
    country: "",
    cityState: "",
    position: "",
    location: "",
  });
  const [editData, setEditData] = useState(profileData);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const apiuri = process.env.NEXT_PUBLIC_API_URL

  // Fetch user profile from tokenData
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/tokenData", { withCredentials: true });
        const user = res.data.user;

        setProfileData({
          firstName: user.fname || "",
          lastName: user.lname || "",
          email: user.email || "",
          phone: user.phone || "",
          bio: user.bio || "",
          country: user.address?.split(", ").pop() || "",
          cityState: user.address?.split(", ")[0] || "",
          position: user.bio || "",
          location: user.address || "",
        });
        setEditData({
          firstName: user.fname || "",
          lastName: user.lname || "",
          email: user.email || "",
          phone: user.phone || "",
          bio: user.bio || "",
          country: user.address?.split(", ").pop() || "",
          cityState: user.address?.split(", ")[0] || "",
          position: user.bio || "",
          location: user.address || "",
        });
        setProfileImage(user.profile ? `/${user.profile}` : null);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
    };

    fetchProfile();
  }, []);

  // Input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  // Image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setImageFile(file);
    setProfileImage(URL.createObjectURL(file)); // preview
  };

  // Save profile

const handleSave = async () => {
  try {
    const formData = new FormData();
    formData.append("fname", editData.firstName);
    formData.append("lname", editData.lastName);
    formData.append("phone", editData.phone);
    formData.append("bio", editData.bio);
    formData.append(
      "address",
      `${editData.cityState}, ${editData.country}`
    );

    if (imageFile) {
      formData.append("profile", imageFile);
    }

    const res = await api.put("/auth/profile", formData, {
      withCredentials: true,
      headers: { "Content-Type": "multipart/form-data" },
    });

    //  update UI
    setProfileData(editData);
    setIsEditing(false);

    if (res.data?.user?.profile) {
      setProfileImage(`/${res.data.user.profile}`);
    }

    //  success toast from API
    toast.success(res.data?.message || "Profile updated successfully");
    window.dispatchEvent(new Event("auth:update"));

  } catch (err: any) {
    console.error("Failed to update profile:", err);

    //  error toast (backend → frontend)
    toast.error(
      err?.response?.data?.message ||
      "Failed to update profile. Please try again."
    );
  }
};


  const handleCancel = () => {
    setEditData(profileData);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-28">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center  justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Review and Update Profile Info
          </h1>
           <h1><Breadcrumb/></h1>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="relative">
                <img
                src={
                  profileImage
                    ? profileImage.startsWith("blob:")
                      ? profileImage
                      : `${apiuri}${profileImage}`
                    : "/default-avatar.png"
                }
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover border"
              />

                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-gray-700 text-white p-1 rounded-full cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleImageChange}
                    />
                    <Edit2 className="w-4 h-4" />
                  </label>
                )}
              </div>

              {/* Name and Title */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {profileData.firstName} {profileData.lastName}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {profileData.position} | {profileData.location}
                </p>
              </div>
            </div>

            {/* Edit/Save/Cancel Buttons */}
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 dark:bg-gray-600 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-500 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 dark:bg-gray-600 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-500 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Personal Information
          </h3>

          <div className="grid grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                First Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="firstName"
                  value={editData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500"
                />
              ) : (
                <p className="text-gray-900 dark:text-white py-2">
                  {profileData.firstName}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Last Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="lastName"
                  value={editData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500"
                />
              ) : (
                <p className="text-gray-900 dark:text-white py-2">
                  {profileData.lastName}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email address
              </label>
              <p className="text-gray-900 dark:text-white py-2">
                {profileData.email}
              </p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={editData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500"
                />
              ) : (
                <p className="text-gray-900 dark:text-white py-2">
                  {profileData.phone}
                </p>
              )}
            </div>

            {/* Bio */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bio
              </label>
              {isEditing ? (
                <input
                  name="bio"
                  value={editData.bio}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500"
                />
              ) : (
                <p className="text-gray-900 dark:text-white py-2">
                  {profileData.bio}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Address
          </h3>

          <div className="grid grid-cols-2 gap-6">
            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Country
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="country"
                  value={editData.country}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500"
                />
              ) : (
                <p className="text-gray-900 dark:text-white py-2">
                  {profileData.country}
                </p>
              )}
            </div>

            {/* City/State */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                City/State
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="cityState"
                  value={editData.cityState}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500"
                />
              ) : (
                <p className="text-gray-900 dark:text-white py-2">
                  {profileData.cityState}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
