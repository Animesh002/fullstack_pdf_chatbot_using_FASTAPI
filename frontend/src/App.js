import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
    const [file, setFile] = useState(null);
    const [documentId, setDocumentId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [uploadedFileName, setUploadedFileName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null); // State for handling errors

    const handleFileUpload = async (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);

        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            const response = await axios.post("http://localhost:8000/upload/", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setDocumentId(response.data.document_id);
            setUploadedFileName(selectedFile.name);
            alert("PDF uploaded successfully! You can now ask questions.");
        } catch (error) {
            console.error("Error uploading file:", error);
            alert("Failed to upload PDF.");
        }
    };

    const handleSendQuestion = async () => {
        if (!documentId) {
            alert("Please upload a document first.");
            return;
        }

        const newMessage = { text: input, isUser: true };
        setMessages([...messages, newMessage]);
        setInput("");
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post("http://localhost:8000/ask/", {
                document_id: documentId,
                question_text: input,
            });
            const aiMessage = { text: response.data.answer || "No answer found.", isUser: false };
            setMessages((prevMessages) => [...prevMessages, aiMessage]);
        } catch (error) {
            console.error("Error asking question:", error);
            setError("Error retrieving answer. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app">
            <header className="header">
                <div className="logo">🌍 AI Planet</div>
                <label className="upload-btn">
                    <input type="file" onChange={handleFileUpload} style={{ display: 'none' }} />
                    Upload PDF
                </label>
                {uploadedFileName && <span className="uploaded-file-name">{uploadedFileName}</span>}
            </header>

            <div className="chat-container">
                {messages.map((msg, index) => (
                    <div key={index} className={`chat-message ${msg.isUser ? "user" : "ai"}`}>
                        {msg.text}
                    </div>
                ))}
                {loading && <div className="loading-indicator">🤔 Processing your question...</div>}
                {error && <div className="error-message">⚠️ {error}</div>}
            </div>

            <div className="message-input">
                <input
                    type="text"
                    placeholder="Ask a question..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendQuestion()}
                />
                <button onClick={handleSendQuestion}>➤</button>
            </div>
        </div>
    );
}

export default App;
