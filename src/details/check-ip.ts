import { Request, Response } from "express";

export const checkIP = async (req: Request, res: Response) => {
  const userIP = req.headers["x-forwarded-for"] || req.ip; // Get the user's IP
  console.log("User IP:", userIP);

  res.send(`User IP: ${userIP}`);
};
