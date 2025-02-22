import { Request, Response } from "express";

export const checkIP = async (req: Request, res: Response) => {
  const userIP = (req.headers["x-forwarded-for"] || req.ip || "")
    .toString()
    .replace(/^::ffff:|^::1:|^::/, "") // Remove all common IPv6 prefixes
    .split(",")[0] // Take first IP if multiple
    .trim();
  console.log("User IP:", userIP);

  res.send(`User IP: ${userIP}`);
};
