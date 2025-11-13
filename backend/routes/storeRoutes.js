import express from "express";
import { getStoreItems, redeemItem } from "../Controllers/StoreController.js";
// import { getStoreItems, redeemItem } from "../controllers/storeController.js";

const router = express.Router();

router.get("/", getStoreItems);
router.post("/redeem", redeemItem);

export default router;
