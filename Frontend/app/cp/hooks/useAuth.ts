
"use client";

import { useEffect, useState } from "react";
import api from "@/app/lib/axios";

export interface UserPayload {
  email: string;
  profile?: string;
  fname?: string;
  lname?: string;
  bio?: string;
  address?: string;
  phone?:string
  iat?: number;
  exp?: number;
}

export default function useAuth() {
  const [user, setUser] = useState<UserPayload | null>(null);
  const [isLoggedOut, setIsLoggedOut] = useState(false);

  // fetch user data
  const fetchUser = async () => {
    if (isLoggedOut) return; // stop if logged out
    try {
      const res = await api.get("/auth/tokenData", { withCredentials: true });
      setUser(res.data.user);
    } catch (err) {
      setUser(null);
    }
  };

  const refreshToken = async () => {
    if (isLoggedOut) return;
    try {
      await api.post("/auth/refresh-token", {}, { withCredentials: true });
      await fetchUser();
    } catch (err) {
      setUser(null);
      window.location.href = "/"; // redirect to login if refresh fails
    }
  };

  // Listen to logout events
  useEffect(() => {
    const handleLogout = () => {
      setUser(null);
      setIsLoggedOut(true);
    };

    window.addEventListener("logout", handleLogout);
    return () => window.removeEventListener("logout", handleLogout);
  }, []);

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
  const handleAuthUpdate = () => {
    fetchUser(); // re-fetch tokenData
  };

  window.addEventListener("auth:update", handleAuthUpdate);
  return () => window.removeEventListener("auth:update", handleAuthUpdate);
}, []);

  useEffect(() => {
    if (!user || !user.exp || isLoggedOut) return;
    const now = Math.floor(Date.now() / 1000);
    const expiryIn = user.exp - now;

    const timeout = setTimeout(() => {
      refreshToken();
    }, (expiryIn - 60) * 1000);

    return () => clearTimeout(timeout);
  }, [user, isLoggedOut]);

  return { user, refreshToken };
} 