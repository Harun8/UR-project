import Attachment from "../components/Attachment";
import Nav from "../components/Nav";

const HomePage = () => {
  return (
    <body className="min-h-screen w-full bg-sky-200">
      <Nav></Nav>
      <>
        <div className="grid h-lvh grid-cols-2 gap-12 content-center">
          {/* Text here */}
          <div className="flex flex-col items-center ">
            <h2 className="text-2xl font-bold text-sky-800">
              PS5 to PSX converter
            </h2>
            <div className="flex justfiy-center">
              <p className="text-md font-semibold text-gray-700 hover:text-black tracking-wide	mx-24 mt-12">
                Upload your existing PS5 program, and let us convert it to PSX
                for you!
              </p>
            </div>
          </div>

          <Attachment></Attachment>
        </div>
      </>
    </body>
  );
};

export default HomePage;
