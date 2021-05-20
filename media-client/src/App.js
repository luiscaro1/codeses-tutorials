import "./App.css";
import React from "react";
import axios from "axios";

function App() {
  const [file, setFile] = React.useState(null);
  const [files, setFiles] = React.useState([]);

  const filehandler = (e) => {
    if (e.target.files != null || e.target.files[0] != null) {
      setFile(e.target.files[0]);
    }
  };

  const uploadFile = async (e) => {
    e.preventDefault();
    if (file) {
      const fd = new FormData();

      fd.append("file", file);

      const res = await axios.post("http://localhost:5000/upload", fd);

      setFiles(files.concat(res.data));
    }
  };

  const fetchFiles = React.useCallback(async () => {
    const res = await axios.get("http://localhost:5000/files");
    setFiles(res.data);
  }, []);

  const removeFile = React.useCallback(
    async (filename, index) => {
      const res = await axios.delete(
        `http://localhost:5000/delete/${filename}`
      );
      if (res.status === 200) {
        let temp = [...files];
        console.log(temp);
        temp.splice(index, 1);

        setFiles(temp);
      }
    },
    [files]
  );

  React.useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  return (
    <div className="App">
      <form className="Form" onSubmit={uploadFile}>
        <input type="file" onChange={filehandler} />
        <button type="submit">upload</button>
      </form>
      <div className="Media">
        {files.map((file, i) => (
          <div key={file._id} className="Item">
            <a
              className="Link"
              href={`http://localhost:5000/read/${file.filename}`}
            >
              {file.filename}
            </a>
            <button
              type="button"
              onClick={() => {
                removeFile(file.filename, i);
              }}
            >
              remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
