import React, { useState } from "react";
import { askQuestion } from "../services/api";

function QuestionForm() {
    const [question, setQuestion] = useState("");
    const handleAsk = async () => {
        const response = await askQuestion({ question_text: question, document_id: 1 });
        console.log(response.data);
    };

    return (
        <div>
            <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
            />
            <button onClick={handleAsk}>Ask Question</button>
        </div>
    );
}

export default QuestionForm;
