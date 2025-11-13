import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../Models/User.js";
import StoreItem from "../Models/StoreSchema.js";
// import User from "../models/userModel.js";
// import StoreItem from "../models/storeItemModel.js";

//
// ─── AUTH HELPER ─────────────────────────────────
const authenticateUser = async (req) => {
  let token;

  if (req.cookies?.jwt) token = req.cookies.jwt;
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  )
    token = req.headers.authorization.split(" ")[1];

  if (!token) throw new Error("Not authorized, no token");

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.userId);
  if (!user) throw new Error("User not found");

  return user;
};

//
// ─── GET STORE ITEMS ─────────────────────────────
export const getStoreItems = asyncHandler(async (req, res) => {
  try {
    const user = await authenticateUser(req);
    const items = await StoreItem.find().sort({ createdAt: -1 });
    res.status(200).json({ userXP: user.xp, items });
  } catch (err) {
    console.error("❌ Store Fetch Error:", err.message);
    res.status(401).json({ message: err.message || "Unauthorized" });
  }
});

//
// ─── REDEEM ITEM ────────────────────────────────
export const redeemItem = asyncHandler(async (req, res) => {
  try {
    const user = await authenticateUser(req);
    const { itemId } = req.body;

    const item = await StoreItem.findById(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });
    if (item.stock <= 0)
      return res.status(400).json({ message: "Out of stock" });

    if (user.xp < item.cost)
      return res.status(400).json({ message: "Not enough XP" });

    // Deduct XP and update user
    user.xp -= item.cost;
    await user.save();

    // Decrease stock
    item.stock -= 1;
    await item.save();

    res.status(200).json({
      message: `✅ Redeemed ${item.name} successfully!`,
      remainingXP: user.xp,
    });
  } catch (err) {
    console.error("❌ Redeem Error:", err.message);
    res.status(401).json({ message: err.message || "Unauthorized" });
  }
});
