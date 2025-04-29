import React from "react";
import { useState } from "react";
import axios from 'axios'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Questions = ({ questionArr }) => {
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [gmail, setGmail] = useState('')
    const[sending,setSending]=useState(false)
    const handleOptionChange = (questionIndex, option) => {
        setSelectedAnswers({ ...selectedAnswers, [questionIndex]: option });
    };

    const generateHtmlContent = async () => {
        setSending(true)
        // use local loading image in the html
        const loading = 'https://res.cloudinary.com/dn4trwbmw/image/upload/v1745935185/arueu9vvhc0sld3ignqd.jpg'
        let html = `
         
        <img src=${loading} width='100px' height='80px' style='border-radius:50%;display:block;margin:auto;' />
        <h1 style="text-align: center;">Quiz Results</h1>
        `;
        questionArr.forEach((question, index) => {
            const userAnswer = selectedAnswers[index];
            const isCorrect = userAnswer === question.answer;
            const notAnswered = !userAnswer;

            const bgColor = notAnswered
                ? "#e2e8f0"  // gray
                : isCorrect
                    ? "#c6f6d5"  // green
                    : "#feb2b2"; // red

            html += `
            <div style="background-color:${bgColor}; padding:1rem; margin-bottom:1rem; border-radius:8px;">
                <p><strong>Q${index + 1}:</strong> ${question.question}</p>
                <p><strong>Your Answer:</strong> ${notAnswered ? "Not answered" : `${userAnswer}. ${question.options[userAnswer]}`
                }</p>
                <p><strong>Correct Answer:</strong> ${question.answer}. ${question.options[question.answer]}</p>
            </div>
        `;
        });
        html += `
        <div style="text-align: center; margin-top: 2rem;">
            <p>MCQ Generator Web Application</p>
            <p>By Chanakya Das Sahu</p>
        </div>
    `;
        // html += ``
        //  console.log('html', html)
        const res = await axios.post('https://paragraph-mcq-generator-ai.vercel.app/htmlContent', { htmlContent: html, gmail: gmail })

        if (res.data.msg ==='Result Sent') {
            toast.success('Result Sent to your Gmail', {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
        else {
            toast.error('Error Sending Result', {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
setSending(false)
    }

    const calculateResults = () => {
        setShowResults(true);
    };

    return (
        <>

            <div className={`max-w-xl mx-auto p-5 h-screen`}>
                <ToastContainer/>
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
                            onClick={() => { location.reload() }}
                            className="border-2 bg-blue-500 text-white py-2 px-6 rounded hover:bg-blue-600 mx-auto"
                        >
                            Refresh
                        </button> <br />

                        <div className="flex justify-center items-center space-x-[10px] space-y-[10px] flex-wrap ">

                            <input type='email' placeholder='Enter your email' onChange={(e) => { setGmail(e.target.value) }} value={gmail} className='border-2 border-gray-300 bg-gray rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-[200px] h-10' />

                            <button
                                onClick={generateHtmlContent}
                                className="border-2 bg-blue-500 text-white py-2 px-6 rounded hover:bg-blue-600 mx-auto" disabled={!gmail || gmail.length < 5 || !gmail.includes('@') || !gmail.includes('.com') || sending}
                            >{sending ? 'Sending...':'Send Result'}</button>
                        </div>
                        <br /><br />
                    </div >
                )}
            </div >
        </>
    )
}

export default Questions;