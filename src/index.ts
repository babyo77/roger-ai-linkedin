import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./router/route";
import { AppError } from "./middleware/asyncHandler";
import { autoCacheMiddleware } from "./middleware/autoCache";

const PORT = process.env.PORT || 9000;
dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Apply auto-caching middleware globally
app.use(autoCacheMiddleware());

app.get("/", (req: Request, res: Response) => {
  res.send("linkedin api is running");
});
app.use("/api", router);

app.use((err: AppError, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});

app.listen(PORT, () => {
  console.log(`Server is running http://localhost:${PORT}`);
});

export default app;
