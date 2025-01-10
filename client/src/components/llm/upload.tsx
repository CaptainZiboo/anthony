"use client";

import { useState, ChangeEvent, FormEvent } from "react";

const UploadForm = () => {
  const [files, setFiles] = useState<File[]>([]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newFiles = event.target.files;
    if (newFiles) {
      setFiles((prevFiles) => [...prevFiles, ...Array.from(newFiles)]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (files.length === 0) return;

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    // Send formData to server-side endpoint
    const response = await fetch("/api/llm/upload", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Server response:", data);
      // File uploaded successfully
      // router.push("/success"); // Uncomment if you want to navigate to a success page
    } else {
      // Handle error
      alert("File upload failed");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input type="file" multiple onChange={handleFileChange} />
        <button type="submit">Upload Files</button>
      </form>
      <div>
        <h3>Selected Files:</h3>
        <ul>
          {files.map((file, index) => (
            <li key={index}>
              {file.name}{" "}
              <button type="button" onClick={() => handleRemoveFile(index)}>
                &times;
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UploadForm;
