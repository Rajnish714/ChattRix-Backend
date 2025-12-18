
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { globalErrorHandler } from "./src/midlleware/errorHandler.middleware.js";
import api from "./src/routes/api.js";

const app = express();

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",")
  : [];

app.use(express.json());

app.use(
  cors({
    origin: (origin, cb) => {
     
      if (!origin) return cb(null, true);

      if (allowedOrigins.length === 0) {
        return cb(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return cb(null, true);
      }

      cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use("/v1", api);
app.use(globalErrorHandler);

export default app;
