import "../styles/Attachment.css";
const Attachment = () => {
  return (
    <div className="container">
      <div className="folder">
        <div className="front-side">
          <div className="tip"></div>
          <div className="cover"></div>
        </div>
        <div className="back-side cover"></div>
      </div>
      <label className="custom-file-upload">
        {/* Call fn to send a post request to the backend */}
        <input
          onChange={() => console.log("file has been added")}
          className="title"
          type="file"
        />
        Choose a file
      </label>
    </div>
  );
};

export default Attachment;
