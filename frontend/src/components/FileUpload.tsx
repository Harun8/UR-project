import "../styles/fileUpload.css";
import { useEffect, useState } from "react";

const FileUpload = (props: any) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [file, setFile] = useState<any>();

  const handleDragOver = (e: any) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileChange = (e: any) => {
    processFile(e.target.files[0]);
  };

  const handleDrop = (e: any) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const processFile = (file: File) => {
    // Extract original file name and extension
    const originalName = file.name;
    const originalExtension = originalName.split(".").pop()?.toLowerCase();

    // Check if the uploaded file has a `.urp` extension
    if (originalExtension === "urp") {
      const newFileName = originalName.replace(/\.urp$/, ".xml");

      // Create a new File object with the `.xml` extension
      const newFile = new File([file], newFileName, {
        type: "application/xml",
      });

      setFileName(newFileName);
      setFile(newFile);
      props.setFile(newFile);
    } else {
      // Handle non-`.urp` files as usual
      setFileName(file.name);
      setFile(file);
      props.setFile(file);
    }
  };

  useEffect(() => {
    console.log("Convert File is:", props.convertFile);
  }, [props.convertFile]);

  return (
    <>
      <div
        className={`file-upload-container ${isDragging ? "dragging" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}>
        <label className="custum-file-upload" htmlFor="file">
          <div className="icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="" viewBox="0 0 24 24">
              <path
                fill=""
                d="M10 1C9.73478 1 9.48043 1.10536 9.29289 1.29289L3.29289 7.29289C3.10536 7.48043 3 7.73478 3 8V20C3 21.6569 4.34315 23 6 23H7C7.55228 23 8 22.5523 8 22C8 21.4477 7.55228 21 7 21H6C5.44772 21 5 20.5523 5 20V9H10C10.5523 9 11 8.55228 11 8V3H18C18.5523 3 19 3.44772 19 4V9C19 9.55228 19.4477 10 20 10C20.5523 10 21 9.55228 21 9V4C21 2.34315 19.6569 1 18 1H10ZM9 7H6.41421L9 4.41421V7ZM14 15.5C14 14.1193 15.1193 13 16.5 13C17.8807 13 19 14.1193 19 15.5V16V17H20C21.1046 17 22 17.8954 22 19C22 20.1046 21.1046 21 20 21H13C11.8954 21 11 20.1046 11 19C11 17.8954 11.8954 17 13 17H14V16V15.5ZM16.5 11C14.142 11 12.2076 12.8136 12.0156 15.122C10.2825 15.5606 9 17.1305 9 19C9 21.2091 10.7909 23 13 23H20C22.2091 23 24 21.2091 24 19C24 17.1305 22.7175 15.5606 20.9844 15.122C20.7924 12.8136 18.858 11 16.5 11Z"
                clipRule="evenodd"
                fillRule="evenodd"></path>
            </svg>
          </div>
          <div className="text">
            <span>
              {fileName || "Click to upload image or drag and drop here"}
            </span>
          </div>
          <input 
          data-testid="upload-file-btn"
            type="file"
            id="file"
            onChange={handleFileChange}
            style={{ display: "none" }}
          /> 

        </label>
      </div>
    </>
  );
};

export default FileUpload;