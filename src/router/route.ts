import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { getUser } from "../user/getUser";
import { getConnection } from "../connections/getConnection";
import { sendConnectionRequest } from "../connections/sendConnection";
import { checkIP } from "../details/check-ip";

const router = Router();

router.get("/check-ip", checkIP);
router.get("/me", asyncHandler(getUser));
router.get("/connections", asyncHandler(getConnection));
router.get("/send-connection", asyncHandler(sendConnectionRequest));
export default router;
