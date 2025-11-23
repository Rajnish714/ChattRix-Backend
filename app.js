
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";


import api from "./src/routes/api.js"; // your routes


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());


app.use("/v1", api);


app.use(express.static(path.join(__dirname, "public")));



export default app;
