import "../styles/Homepage.css";
import FileUpload from "../components/FileUpload";
import { useEffect, useState } from "react";
const HomePage = () => {
  const [file, setFile] = useState(false);
  useEffect(() => {
    console.log("files uploaded", file);
  }, [file]);
  const convertFile = async (file: any) => {
    try {
      
      const formData = new FormData();
      // Append the file and its metadata
      formData.append("file", file);
      formData.append("file_title", file.name);
  
      const response = await fetch("http://localhost:3000/api/v1/file", {
        method: "POST",
        body: formData,
      });
  
      // Proper delay using a promise

  
      if (!response.ok) {
    
        throw new Error("Failed to process the file");
      }
  
      // Get the response as a blob (binary large object)
      const blob = await response.blob();
  
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
  
      // Modify the file name to have the `.urpx` extension
      const originalFileName = file.name;
      const newFileName = originalFileName.replace(/\.[^/.]+$/, ".urpx"); // Replace extension with .urpx
  
      // Create an anchor element to trigger download
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
  
      // Set the download attribute to the modified file name
      a.download = newFileName;
  
      document.body.appendChild(a);
      a.click();
  
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error in convertFile:", error);
    } finally {
  
    }
  };
  
  return (
    <>
      <div className=" bg-white flex flex-col py-24 items-center text-center min-h-screen">
        <h1 className="text-7xl font-bold font-sans mb-4 font-extrabold	 text-gray-800 ">
          <span className="title"> PolyScope X </span>
          <br></br>
          <span>Converter</span>
        </h1>
        <p className="text-gray-500 mb-8">
          {" "}
          Convert your PolyScope 5 files to PolyScope x
        </p>
        <div className="flex space-x-4">
          <button data-testid="convert-btn"
            onClick={() => file && convertFile(file)}
            className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-10 rounded-lg hover:bg-gray-800">
            Click here to convert
          </button>
          <button className="border border-gray-500 text-gray-950 font-bold py-3 px-10  rounded-lg hover:bg-gray-100">
            Read more
          </button>
        </div>
        <div className=" mt-12 w-[1000px] h-[100px] flex justify-center">
          <FileUpload setFile={setFile}></FileUpload>
        </div>
      </div>
    </>
  );
};
export default HomePage;