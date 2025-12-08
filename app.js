import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import { globalErrorHandler } from "./src/midlleware/errorHandler.middleware.js";
import api from "./src/routes/api.js"; 

const allowedOrigins = ["http://localhost:3000", "http://192.168.1.12:3000"];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(cors({
   origin: function(origin, callback) {
   
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use("/assets", express.static("public/assets"));
app.use("/v1", api);
app.use(globalErrorHandler)

export default app;
