import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler";
import { getUser } from "../user/getUser";
import { getConnection } from "../connections/getConnection";
import { sendConnectionRequest } from "../connections/sendConnection";
import { checkIP } from "../details/checkIP";
import { sendMessage } from "../message/sendMessage";

const router = Router();

router.get("/check-ip", checkIP);
router.get("/me", asyncHandler(getUser));
router.get("/connections", asyncHandler(getConnection));
router.get("/send-connection", asyncHandler(sendConnectionRequest));
router.get("/send-message", asyncHandler(sendMessage));
export default router;
