import ShineBorder from "../components/ui/shine-border";
import "../styles/Homepage.css"
import FileUpload from "../components/FileUpload"
import { useState } from "react";

const HomePage = () => {
  const [convertFile, setConvertFile] = useState(false)
  return (
    <>
      <div className=" bg-white flex flex-col py-24 items-center text-center min-h-screen">
        <h1 className="text-7xl font-bold font-sans mb-4 font-extrabold	 text-gray-800 ">
         <span className="title"> PolyScope X </span><br></br>
          <span> Converter</span>
        </h1>
        <p className="text-gray-500 mb-8"> Convert your PolyScope 5 files to PolyScope x</p>

        <div className="flex space-x-4">
          <button onClick={() => setConvertFile(prev => !prev)}
          
            className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-10 rounded-lg hover:bg-gray-800">
            Click here to convert
          </button>
          <button
           
            className="border border-gray-500 text-gray-950 font-bold py-3 px-10  rounded-lg hover:bg-gray-100">
            Read more
          </button>
        </div>
        <div className=" mt-12 w-[1000px] h-[100px] flex justify-center">
     
        <FileUpload convertFile={convertFile}></FileUpload>
        </div>
      </div>

      </>
  );
};

export default HomePage;
