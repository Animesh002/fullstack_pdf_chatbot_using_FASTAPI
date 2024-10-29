// src/services/api.js
import axios from "axios";

// Function to upload a PDF
export const uploadPDF = async (formData) => {
    try {
        const response = await axios.post("http://127.0.0.1:8000/upload_pdf", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error uploading PDF:", error);
        throw error;
    }
};

// Function to ask a question based on an uploaded PDF
export const askQuestion = async (question, pdfId) => {
    try {
        const response = await axios.post("http://127.0.0.1:8000/ask_question", {
            question,
            pdf_id: pdfId  // Assuming your backend needs a PDF ID
        });
        return response.data;
    } catch (error) {
        console.error("Error asking question:", error);
        throw error;
    }
};
