import "../styles/Attachment.css";
const Attachment = () => {
  return (
    <div class="container">
      <div class="folder">
        <div class="front-side">
          <div class="tip"></div>
          <div class="cover"></div>
        </div>
        <div class="back-side cover"></div>
      </div>
      <label class="custom-file-upload">
        <input class="title" type="file" />
        Choose a file
      </label>
    </div>
  );
};

export default Attachment;
