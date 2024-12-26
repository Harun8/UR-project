import {file} from "../controllers/FileController"
import express from "express";
const router = express.Router();
import multer from "multer";

const upload = multer({ dest: "files/input" }); // Files will be stored in the 'uploads/' directory

router.route("/file").post(upload.single("file"), file);

export default router;