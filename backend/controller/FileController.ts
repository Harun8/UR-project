import { Response, Request } from "express";

import fs from "fs";
import { Buffer } from "buffer";
import path from "path";
import { fileReading } from "../indexSecond";

export const file = async (req: Request, res: Response): Promise<any> => {
  try {
    const file = req.file; // The uploaded file
    if (!file) {
      return res.status(404).json({ err: "No file uploaded" });
    }

    const filePath = path.resolve(file.path);

    // Read the uploaded file into a buffer
    const buffer = fs.readFileSync(filePath);

    // Convert the buffer back to a string (assumes UTF-8 encoding)
    const xmlContent = buffer.toString("utf-8");

    console.log("Decoded XML Content:", xmlContent); // could remove the reading part

    // Optionally delete the file after processing
    // fs.unlinkSync(filePath);

    await fileReading(filePath);
    // Send the XML content back to the client or process it further
    res
      .status(200)
      .json({ message: "File processed successfully", xmlContent });
  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).json({ err: "Error processing file" });
  }
};
