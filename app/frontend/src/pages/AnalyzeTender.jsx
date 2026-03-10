import { useState } from "react";

export default function AnalyzeTender() {

  const [file, setFile] = useState(null);

  const upload = async () => {
    const data = new FormData();
    data.append("file", file);

    await fetch("/upload-tor", {
      method: "POST",
      body: data
    });
  };

  const runAnalysis = async () => {
    await fetch("/run-analysis", {
      method: "POST"
    });
  };

  return (
    <div>
      <h2>Tender Analyzer</h2>

      <input
        type="file"
        onChange={(e)=>setFile(e.target.files[0])}
      />

      <button onClick={upload}>Upload</button>

      <button onClick={runAnalysis}>Run Analysis</button>
    </div>
  );
}