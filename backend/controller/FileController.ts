import { Response, Request } from "express";
import fs from "fs";
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

    // Optionally delete the file after processing
    // fs.unlinkSync(filePath);

    const urpxBuffer = await fileReading(filePath);

    // Dynamically set the filename with .urpx extension
    const originalFileName = path.basename(file.originalname, path.extname(file.originalname));
    const newFileName = `${originalFileName}.urpx`;

    // Set the appropriate headers for downloading the file
    res.setHeader("Content-Disposition", `attachment; filename="${newFileName}"`);
    res.setHeader("Content-Type", "application/octet-stream");

    console.log("urpxBuffer generated:", urpxBuffer);

    // Send the processed file buffer to the client
    return res.send(urpxBuffer);

  } catch (error) {
    console.error("Error processing file:", error);
    res.status(500).json({ err: "Error processing file" });
  }
};
