import React from "react";
import { useState } from "react";
const Questions = ({ questionArr }) => {
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);

    const handleOptionChange = (questionIndex, option) => {
        setSelectedAnswers({ ...selectedAnswers, [questionIndex]: option });
    };

    const calculateResults = () => {
        setShowResults(true);
    };

    return (
        <>

            <div className={`max-w-xl mx-auto p-6 h-screen`}>
                <div className={`flex flex-col h-auto ${showResults ? 'hidden' : ' '}`}>
                    {questionArr.map((question, index) => (
                        <div key={index} className="mb-6 bg-white p-4 shadow rounded">
                            <h2 className="font-bold text-lg mb-4">
                                Q{index + 1}: {question.question}
                            </h2>
                            <div>
                                {Object.entries(question.options).map(([key, value]) => (
                                    <label
                                        key={key}
                                        className="block cursor-pointer mb-2 border p-2 rounded hover:bg-gray-100"
                                    >
                                        <input
                                            type="radio"
                                            name={`question-${index}`}
                                            value={key}
                                            checked={selectedAnswers[index] === key}
                                            onChange={() => handleOptionChange(index, key)}
                                            className="mr-2"
                                        />
                                        {key}:  {value}
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}


                    <button
                        onClick={calculateResults}
                        className="border-2 bg-blue-500 text-white py-2 px-6 rounded hover:bg-blue-600 mx-auto"
                    >
                        Submit
                    </button>
                    <br /><br />
                </div>



                {showResults && (
                    <div className="mt-6 h-auto flex flex-col">
                        <h3 className="text-xl font-bold mb-4">Results</h3>
                        {questionArr.map((question, index) => (
                            <div
                                key={index}
                                className={`mb-4 p-4 rounded ${!selectedAnswers[index] ? "bg-gray-300" :
                                    selectedAnswers[index] === question.answer
                                        ? "bg-green-300"
                                        : "bg-red-300"
                                    }`}
                            >
                                <p>
                                    <strong>Q{index + 1}:</strong> {question.question}
                                </p>
                                <p>
                                    <strong>Your Answer:</strong>{" "}
                                    {selectedAnswers[index]
                                        ? <> {selectedAnswers[index]} . {question.options[selectedAnswers[index]]}</>
                                        : "Not answered"}
                                </p>
                                <p>
                                    <strong>Correct Answer:</strong> {question.answer} . {question.options[question.answer]}
                                </p>
                            </div>
                        ))}
                        <button
                            onClick={()=>{location.reload()}}
                            className="border-2 bg-blue-500 text-white py-2 px-6 rounded hover:bg-blue-600 mx-auto"
                        >
                            Refresh
                        </button>

                        <br /><br />
                    </div>
                )}
            </div>
        </>
    )
}

export default Questions;