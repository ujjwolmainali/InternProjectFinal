import { Router } from 'express';
import prisma from '../lib/prisma';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import verify from '../middleware/verify';
import fs from "fs";
import path from "path";
import uploadProfile from '../middleware/Profile_Img_update';

const Authrouter = Router();
Authrouter.post("/signup", async (req, res) => {
  try {
    const {
      email,
      password,
      First_Name,
      Last_Name,
      phone,
      Address,
    } = req.body;

    if (!email || !password || !First_Name || !Last_Name) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // Check existing user
    const existingUser = await prisma.login.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    await prisma.login.create({
      data: {
        email,
        password: hashedPassword,
        profile: "uploads\\profile\\P_image.png",
        First_Name,
        Last_Name,
        Bio: "Admin",
        phone: phone || "",
        Address: Address || "",
      },
    });

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


Authrouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await prisma.login.findUnique({
      where: { email },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const payload = {
        email: user.email,
        profile:user.profile,
        fname:user.First_Name, 
        lname:user.Last_Name, 
        bio:user.Bio,
        phone:user.phone, 
        address:user.Address 
      };


    const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: "15m",
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // true in production (HTTPS)
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login successful",
      status: true,
      user: {
        email: user.email,
        First_Name: user.First_Name,
        Last_Name: user.Last_Name,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


Authrouter.post("/refresh-token", (req, res) => {
  try {
    const authHeader = req.headers.authorization;
  const cookieToken = req.cookies?.refreshToken;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : cookieToken;

    if (!token)
      return res.status(401).json({ message: "No refresh token found" });

    jwt.verify(token, process.env.JWT_SECRET!, (err:any, decoded: any) => {
      if (err)
        return res.status(403).json({ message: "Invalid refresh token" });

      const payload = { 
        email: decoded.email,
        profile: decoded.profile,
        fname: decoded.fname, 
        lname: decoded.lname,
        bio: decoded.bio,
        phone: decoded.phone,   
        address: decoded.address 
      };


      const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
        expiresIn: "15m",
      });

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
       sameSite: "strict",
        maxAge: 15 * 60 * 1000,
      });

      res.json({ message: "Access token refreshed" });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


Authrouter.post("/logout", (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "strict",
    secure: false,
  });

  res.clearCookie("accessToken", {
    httpOnly: true,
     sameSite: "strict",
    secure: false,
  });

  res.json({ message: "Logged out successfully" });
});

Authrouter.get("/tokenData", verify, (req, res) => {
  // req.user is set by the verify middleware
  res.status(200).json({
    message: "User info retrieved successfully",
    user: req.user,
  });
});



Authrouter.put(
  "/profile",
  verify,
  uploadProfile.single("profile"),
  async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const email = req.user.email;
      const { fname, lname, phone, bio, address } = req.body;

      // Get old profile
      const existingUser = await prisma.login.findUnique({
        where: { email },
        select: { profile: true },
      });

      let profilePath = existingUser?.profile;

      // Handle new image
      if (req.file) {
        profilePath = `uploads/profile/${req.file.filename}`;

        if (existingUser?.profile) {
          const oldPath = path.join(process.cwd(), existingUser.profile);
          fs.existsSync(oldPath) && fs.unlinkSync(oldPath);
        }
      }

      // Update DB
      const updatedUser = await prisma.login.update({
        where: { email },
        data: {
          First_Name: fname,
          Last_Name: lname,
          phone,
          Bio: bio,
          Address: address,
          profile: profilePath,
        },
      });

      // NEW JWT PAYLOAD
      const payload = {
        email: updatedUser.email,
        profile: updatedUser.profile,
        fname: updatedUser.First_Name,
        lname: updatedUser.Last_Name,
        bio: updatedUser.Bio,
        phone: updatedUser.phone,
        address: updatedUser.Address,
      };

      // RE-ISSUE TOKENS
      const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
        expiresIn: "15m",
      });

      const refreshToken = jwt.sign(payload, process.env.JWT_SECRET!, {
        expiresIn: "7d",
      });

      // OVERWRITE COOKIES
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        message: "Profile updated successfully",
        user: payload, // send updated payload
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Profile update failed" });
    }
  }
);




export default Authrouter;
