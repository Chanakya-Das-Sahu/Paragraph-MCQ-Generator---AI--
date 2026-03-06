import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const Questions = ({ questionArr, changeSubmitted }) => {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [gmail, setGmail] = useState("");
  const [sending, setSending] = useState(false);
  const [chart, setChart] = useState({ right: 0, wrong: 0, notAnswered: 0 });

  const handleOptionChange = (questionIndex, option) => {
    setSelectedAnswers({ ...selectedAnswers, [questionIndex]: option });
  };

  const calculateResults = () => {
    let right = 0;
    let wrong = 0;

    questionArr.forEach((q, index) => {
      if (selectedAnswers[index] === q.answer) right++;
      else if (selectedAnswers[index]) wrong++;
    });

    const notAnswered = questionArr.length - (right + wrong);
    setChart({ right, wrong, notAnswered });
    setShowResults(true);
  };

  const generateHtmlContent = async () => {
    setSending(true);

    let html = `
<div style="background-color: #f4f7ff; padding: 20px; font-family: 'Segoe UI', Tahoma, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        
        <div style="background: #4F46E5; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Quiz Report</h1>
            <p style="color: #e0e7ff; margin-top: 10px;">Results Overview</p>
        </div>
        
        <div style="padding: 20px;">
            <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 30px; border-bottom: 1px solid #f0f0f0; padding-bottom: 20px;">
                <tr>
                    <td align="center" style="width: 33%;">
                        <span style="display: block; font-size: 20px; font-weight: bold; color: #4F46E5;">${chart.right}</span>
                        <span style="font-size: 10px; color: #6b7280; text-transform: uppercase;">Correct</span>
                    </td>
                    <td align="center" style="width: 33%;">
                        <span style="display: block; font-size: 20px; font-weight: bold; color: #ef4444;">${chart.wrong}</span>
                        <span style="font-size: 10px; color: #6b7280; text-transform: uppercase;">Wrong</span>
                    </td>
                    <td align="center" style="width: 33%;">
                        <span style="display: block; font-size: 20px; font-weight: bold; color: #9ca3af;">${chart.notAnswered}</span>
                        <span style="font-size: 10px; color: #6b7280; text-transform: uppercase;">Skipped</span>
                    </td>
                </tr>
            </table>

            <h2 style="font-size: 18px; color: #1f2937; margin-bottom: 20px;">Detailed Review</h2>

            ${questionArr
              .map((item, index) => {
                const userSelectionKey = selectedAnswers[index];
                const isAnswered = !!userSelectionKey;
                const isCorrect = userSelectionKey === item.answer;

                const correctText = item.options[item.answer];
                const userText = isAnswered
                  ? item.options[userSelectionKey]
                  : "Not Answered";

                // --- DYNAMIC STYLING LOGIC ---
                let bgColor = "#f9fafb"; // Default Gray for Skipped
                let borderColor = "#d1d5db";
                let statusIcon = "⚪";

                if (isAnswered) {
                  if (isCorrect) {
                    bgColor = "#f0fdf4"; // Green
                    borderColor = "#22c55e";
                    statusIcon = "✅";
                  } else {
                    bgColor = "#fef2f2"; // Red
                    borderColor = "#ef4444";
                    statusIcon = "❌";
                  }
                }

                return `
                <div style="margin-bottom: 20px; padding: 15px; border-radius: 12px; background-color: ${bgColor}; border-left: 5px solid ${borderColor};">
                    <p style="margin: 0 0 10px 0; font-weight: 600; color: #1f2937; font-size: 16px;">
                        ${index + 1}. ${item.question}
                    </p>
                    <div style="font-size: 14px; color: #374151;">
                        <p style="margin: 5px 0;">
                            <strong>Your Choice:</strong> ${isAnswered ? `(${userSelectionKey}) ${userText}` : `<i style="color: #6b7280;">Skipped</i>`} 
                            ${statusIcon}
                        </p>
                        ${
                          !isCorrect
                            ? `
                            <p style="margin: 5px 0; color: #1f2937;">
                                <strong style="color: #4F46E5;">Correct Answer:</strong> (${item.answer}) ${correctText}
                            </p>
                        `
                            : ""
                        }
                    </div>
                </div>`;
              })
              .join("")}

            <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #f0f0f0; margin-top: 20px;">
                <p style="font-size: 12px; color: #9ca3af; margin: 0;">Generated by Quiz App &bull; ${new Date().toLocaleDateString("en-IN")}</p>
            </div>
        </div>
    </div>
</div>`;

    try {
      const res = await axios.post("http://localhost:3000/htmlContent", {
        htmlContent: html,
        gmail: gmail,
      });
      if (res.data.msg === "Result Sent")
        toast.success("Result Sent to your Gmail");
      else toast.error("Error Sending Result");
    } catch (e) {
      toast.error("Failed to connect to server");
    }
    setSending(false);
  };

  // --- CHART COMPONENT ---
  const PieChart = () => {
    const options = {
      plugins: {
        legend: {
          position: "bottom",
          labels: { color: "#4B5563", font: { weight: "600" } },
        },
      },
      maintainAspectRatio: false,
    };

    const data = {
      labels: ["Correct", "Wrong", "Skipped"],
      datasets: [
        {
          data: [chart.right, chart.wrong, chart.notAnswered],
          backgroundColor: ["#4F46E5", "#EF4444", "#E5E7EB"],
          borderWidth: 0,
        },
      ],
    };
    return (
      <div className="h-64 w-full">
        <Pie data={data} options={options} />
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
      <ToastContainer />
      {!showResults ? (
        /* QUIZ VIEW */
        <div className="space-y-6 pb-20">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-[#111827]">
              Knowledge Check
            </h1>
            <p className="text-gray-500 font-medium">
              Select the best answer for each question.
            </p>
          </div>
          {questionArr.map((question, index) => (
            <div
              key={index}
              className="bg-white border border-[#E0E7FF] p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4 mb-4">
                <span className="bg-[#EEF2FF] text-[#4F46E5] font-black px-3 py-1 rounded-lg text-sm">
                  Q{index + 1}
                </span>
                <h2 className="font-bold text-[#1F2937] text-lg leading-snug">
                  {question.question}
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {Object.entries(question.options).map(([key, value]) => (
                  <label
                    key={key}
                    className={`group flex items-center p-4 rounded-2xl border-2 cursor-pointer transition-all 
                                        ${selectedAnswers[index] === key ? "border-[#4F46E5] bg-[#EEF2FF]" : "border-[#F3F4F6] hover:border-[#E0E7FF] hover:bg-[#F9FAFB]"}`}
                  >
                    <input
                      type="radio"
                      name={`question-${index}`}
                      checked={selectedAnswers[index] === key}
                      onChange={() => handleOptionChange(index, key)}
                      className="w-5 h-5 text-[#4F46E5]"
                    />
                    <span
                      className={`ml-4 font-semibold ${selectedAnswers[index] === key ? "text-[#4F46E5]" : "text-gray-600"}`}
                    >
                      <span className="opacity-50 mr-2">{key}.</span> {value}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2">
            <button
              onClick={calculateResults}
              className="bg-[#111827] text-white py-4 px-12 rounded-2xl font-black text-lg shadow-2xl hover:bg-[#1F2937] active:scale-95 transition-all"
            >
              Finalize Answers
            </button>
          </div>
        </div>
      ) : (
        /* RESULTS VIEW */
        <div className="space-y-8 pb-20">
          <div className="bg-white rounded-[2.5rem] border border-[#E0E7FF] p-8 shadow-xl">
            <h3 className="text-2xl font-black text-[#111827] mb-6 text-center">
              Your Performance
            </h3>
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 w-full max-w-[280px]">
                <PieChart />
              </div>
              <div className="flex-1 space-y-4 w-full">
                <div className="bg-[#F9FAFB] p-4 rounded-2xl border border-[#E0E7FF]">
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                    Total Score
                  </p>
                  <p className="text-4xl font-black text-[#1F2937]">
                    {chart.right}{" "}
                    <span className="text-xl text-gray-400">
                      / {questionArr.length}
                    </span>
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-2xl">
                    <p className="text-xs font-bold text-green-600 uppercase">
                      Correct
                    </p>
                    <p className="text-xl font-bold text-green-700">
                      {chart.right}
                    </p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-2xl">
                    <p className="text-xs font-bold text-red-600 uppercase">
                      Wrong
                    </p>
                    <p className="text-xl font-bold text-red-700">
                      {chart.wrong}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-[#111827] ml-2">
              Review Answers
            </h4>
            {questionArr.map((question, index) => {
              const isCorrect = selectedAnswers[index] === question.answer;
              const skipped = !selectedAnswers[index];
              return (
                <div
                  key={index}
                  className={`p-6 rounded-3xl border-2 ${skipped ? "bg-gray-50 border-gray-200" : isCorrect ? "bg-white border-green-200" : "bg-white border-red-200"}`}
                >
                  <p className="font-bold text-[#1F2937] mb-2">
                    Q{index + 1}: {question.question}
                  </p>
                  <div className="text-sm space-y-1">
                    <p
                      className={`${skipped ? "text-gray-500" : isCorrect ? "text-green-600 font-bold" : "text-red-500 font-bold"}`}
                    >
                      Your Answer:{" "}
                      {selectedAnswers[index]
                        ? `${selectedAnswers[index]}. ${question.options[selectedAnswers[index]]}`
                        : "Skipped"}
                    </p>
                    <p className="text-indigo-600 font-bold">
                      Correct: {question.answer}.{" "}
                      {question.options[question.answer]}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="bg-[#111827] p-8 rounded-[2rem] text-white space-y-6 shadow-2xl">
            <h4 className="text-center font-bold text-indigo-300 uppercase tracking-widest text-sm">
              Save your report
            </h4>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="email@example.com"
                onChange={(e) => setGmail(e.target.value)}
                value={gmail}
                className="flex-1 bg-gray-800 border-none rounded-xl p-4 text-white focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={generateHtmlContent}
                disabled={!gmail.includes("@") || sending}
                className="bg-[#4F46E5] hover:bg-[#6366F1] disabled:bg-gray-700 text-white py-4 px-8 rounded-xl font-bold transition-all"
              >
                {sending ? "Sending..." : "Email Report"}
              </button>
            </div>
            <button
              onClick={() => changeSubmitted(false)}
              className="w-full text-gray-400 hover:text-white text-xs font-bold transition-all uppercase tracking-widest pt-4 border-t border-white/10"
            >
              Create New Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Questions;
