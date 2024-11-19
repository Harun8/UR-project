import express from "express";

const app = express();
import FileRoute from "./route/FileRoute";

import cors from "cors";
// routes

const port: number = 3000;

const corsOptions = {
  origin: "http://localhost:5173", // Specify the allowed origin
  credentials: true, // Allow credentials (cookies, etc.) to be sent
};

app.use(cors(corsOptions));
// app.use(cors());
// app.use(cookieParser());

app.use(express.json());

app.use("/api/v1", FileRoute);

app.listen(port, () => {
  console.log("Server is running on portttt ", port);
});
