// src/components/PdfUploader.js
import React, { useState } from "react";
import { uploadPDF } from "../services/api";

function PdfUploader() {
    const [file, setFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState("");  // For displaying status messages

    const handleFileChange = (e) => setFile(e.target.files[0]);

    const handleUpload = async () => {
        if (!file) {
            setUploadStatus("Please select a file first.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            setUploadStatus("Uploading...");
            await uploadPDF(formData);
            setUploadStatus("Upload successful!");
        } catch (error) {
            setUploadStatus("Upload failed. Please try again.");
            console.error("Upload Error:", error);
        }
    };

    return (
        <div>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload}>Upload PDF</button>
            {uploadStatus && <p>{uploadStatus}</p>} {/* Display status messages */}
        </div>
    );
}

export default PdfUploader;
