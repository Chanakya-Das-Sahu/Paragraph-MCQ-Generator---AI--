// import React, { useState } from "react";
// import axios from "axios";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { Pie } from "react-chartjs-2";
// import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
// import getServerUrl from "../utils/getServerUrl";

// ChartJS.register(ArcElement, Tooltip, Legend);

// const QuestionRenderingPage = ({ questionArr, changeSubmitted }) => {
//   const [selectedAnswers, setSelectedAnswers] = useState({});
//   const [subjectiveAnswers, setSubjectiveAnswers] = useState({});
//   const [showResults, setShowResults] = useState(false);
//   const [gmail, setGmail] = useState("");
//   const [sending, setSending] = useState(false);
//   const [chart, setChart] = useState({ right: 0, wrong: 0, notAnswered: 0 });

//   // ✅ NEW: AI Insights
//   const [aiInsights, setAiInsights] = useState(null);

//   const handleOptionChange = (questionIndex, option) => {
//     setSelectedAnswers({ ...selectedAnswers, [questionIndex]: option });
//   };

//   const handleSubjectiveChange = (questionIndex, answer) => {
//     setSubjectiveAnswers({ ...subjectiveAnswers, [questionIndex]: answer });
//   };

//   // ✅ MAIN LOGIC (UPDATED)
//   const calculateResults = async () => {
//     let right = 0;
//     let wrong = 0;
//     let notAnswered = 0;
//     let hasSubjective = false;

//     questionArr.forEach((q, index) => {
//       if (q.type === "mcq") {
//         if (selectedAnswers[index] === q.answer) right++;
//         else if (selectedAnswers[index]) wrong++;
//         else notAnswered++;
//       } else {
//         hasSubjective = true;
//         if (subjectiveAnswers[index]?.trim()) right++;
//         else notAnswered++;
//       }
//     });

//     setChart({ right, wrong, notAnswered });
//     setShowResults(true);

//     // ✅ ONLY FOR SUBJECTIVE → CALL AI FROM FRONTEND
//     if (hasSubjective) {
//       try {
//         const apiKey = import.meta.env.VITE_GROQ_API_KEY;

//         const payload = questionArr.map((q, i) => ({
//           question: q.question,
//           answer: subjectiveAnswers[i] || ""
//         }));
//     console.log("Payload for AI Evaluation:", payload);
// const prompt = `
// You are a teacher.

// Evaluate answers based on:
// 1. Accuracy
// 2. Completeness
// 3. Key concepts

// Important instructions:
// - Accept synonymous or equivalent correct answers (e.g., "a tag" = "<a>" = anchor tag).
// - Do NOT mark correct answers wrong due to wording differences.
// - Only reduce marks if concept is missing, incorrect, or misleading.
// - Prefer standard HTML knowledge (e.g., <a> is correct for hyperlinks; <link> is NOT for clickable links).
// - Accept both HTML attributes and CSS where appropriate, but do not penalize valid basic answers.

// Provide short, clear tips for each question. Overall tip can be slightly longer.

// Rules:
// - Fully correct + clear → 90–100%
// - Correct but slightly incomplete → 70–89%
// - Partially correct → 40–69%
// - Mostly incorrect → 10–39%
// - Completely wrong → 0–9%

// Output format:

// {
//   "questions": [
//     {
//       "question": "string",
//       "percentage": number,
//       "tip": "string"
//     }
//   ],
//   "overall": {
//     "percentage": number,
//     "tip": "string"
//   }
// }

// Also fix any incorrect reasoning in tips.

// Return ONLY JSON (no code, no explanation).

// Input:
// ${JSON.stringify(payload)}
// `;

//         const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${apiKey}`
//         },
//        body: JSON.stringify({
//             model: "llama-3.1-8b-instant",
//             messages: [{ role: "user", content: prompt }],
//             temperature: 0.3
//           })
//       });
//         console.log("AI API Response Status:", res);
//         const data = await res.json();
//         console.log("Full AI Response:", data);
//         let text = data?.choices?.[0]?.message?.content;
//     console.log("Raw AI Response:", text);
//         text = text.replace(/```json/g, "").replace(/```/g, "");

//         const parsed = JSON.parse(text);
//         console.log("Parsed AI Insights:", parsed);
//         setAiInsights(parsed);

//       } catch (err) {
//         console.error(err);
//         toast.error("AI evaluation failed");
//       }
//     }
//   };

//   const generateHtmlContent = async () => {
//     setSending(true);

//     let html = `<div><h2>Quiz Report</h2></div>`;

//     try {
//       await axios.post(`${getServerUrl()}/htmlContent`, {
//         htmlContent: html,
//         gmail,
//       });
//       toast.success("Result Sent");
//     } catch {
//       toast.error("Failed");
//     }

//     setSending(false);
//   };

//    // --- CHART COMPONENT ---
//   const PieChart = () => {
//     const options = {
//       plugins: {
//         legend: {
//           position: "bottom",
//           labels: { color: "#4B5563", font: { weight: "600" } },
//         },
//       },
//       maintainAspectRatio: false,
//     };

//     const data = {
//       labels: ["Correct", "Wrong", "Skipped"],
//       datasets: [
//         {
//           data: [chart.right, chart.wrong, chart.notAnswered],
//           backgroundColor: ["#00D100", "#EF4444", "#E5E7EB"],
//           borderWidth: 0,
//         },
//       ],
//     };
//     return (
//       <div className="h-64 w-full">
//         <Pie data={data} options={options} />
//       </div>
//     );
//   };

//   return (
//     <div className="max-w-3xl mx-auto p-4">
//       <ToastContainer />

//       {!showResults ? (
//         /* ================= QUIZ ================= */
//         <div>
//           {questionArr.map((q, i) => (
//             <div key={i}>
//               <p>{q.question}</p>

//               {q.type === "mcq" ? (
//                 Object.entries(q.options).map(([k, v]) => (
//                   <label key={k}>
//                     <input
//                       type="radio"
//                       checked={selectedAnswers[i] === k}
//                       onChange={() => handleOptionChange(i, k)}
//                     />
//                     {k}. {v}
//                   </label>
//                 ))
//               ) : (
//                 <textarea
//                   value={subjectiveAnswers[i] || ""}
//                   onChange={(e) =>
//                     handleSubjectiveChange(i, e.target.value)
//                   }
//                 />
//               )}
//             </div>
//           ))}

//           <button onClick={calculateResults}>Submit</button>
//         </div>
//       ) : (
//         /* ================= RESULTS ================= */
//         <div>
//           <div className="flex flex-col md:flex-row items-center gap-8">
//   <div className="flex-1 w-full max-w-[280px]">
//     <PieChart />
//   </div>

//   <div className="flex-1 space-y-4 w-full">
//     {/* Total Score */}
//     <div className="bg-[#F9FAFB] p-4 rounded-2xl border border-[#E0E7FF]">
//       <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
//         Total Score
//       </p>
//       <p className="text-4xl font-black text-[#1F2937]">
//         {chart.right}{" "}
//         <span className="text-xl text-gray-400">
//           / {questionArr.length}
//         </span>
//       </p>
//     </div>

//     {/* Stats */}
//     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      
//       {/* Correct */}
//       <div className="p-4 bg-green-50 rounded-2xl">
//         <p className="text-xs font-bold text-green-600 uppercase">
//           Correct
//         </p>
//         <p className="text-xl font-bold text-green-700">
//           {chart.right}
//         </p>
//       </div>

//       {/* Wrong */}
//       <div className="p-4 bg-red-50 rounded-2xl">
//         <p className="text-xs font-bold text-red-600 uppercase">
//           Wrong
//         </p>
//         <p className="text-xl font-bold text-red-700">
//           {chart.wrong}
//         </p>
//       </div>

//       {/* Skipped */}
//       <div className="p-4 bg-gray-50 rounded-2xl">
//         <p className="text-xs font-bold text-gray-600 uppercase">
//           Skipped
//         </p>
//         <p className="text-xl font-bold text-gray-700">
//           {chart.notAnswered}
//         </p>
//       </div>

//     </div>
//   </div>
//   </div>

//           {questionArr.map((q, i) => {
//             const isMCQ = q.type === "mcq";

//             return (
//               <div key={i}>
//                 <p>Q{i+1}. {q.question}</p>

//                 {/* ✅ MCQ (UNCHANGED) */}
//                 {isMCQ ? (
//                   <>
//                     <p>
//                       Your Answer:{" "}
//                       {selectedAnswers[i]
//                         ? `${selectedAnswers[i]}. ${q.options[selectedAnswers[i]]}`
//                         : "Skipped"}
//                     </p>

//                     <p>
//                       Correct: {q.answer}. {q.options[q.answer]}
//                     </p>
//                   </>
//                 ) : (
//                   /* ✅ SUBJECTIVE WITH AI */
//                   <>
//                     <p>
//                       Your Answer: {subjectiveAnswers[i] || "Skipped"}
//                     </p>

//                     {aiInsights?.questions?.[i] && (
//                       <div style={{ background: "#eef2ff", padding: "10px" }}>
//                         <p>
//                           Correctness: {aiInsights.questions[i].percentage}%
//                         </p>
//                         <p>💡 {aiInsights.questions[i].tip}</p>
//                       </div>
//                     )}<br/>
//                   </>
//                 )}
//               </div>
//             );
//           })}

//           {/* ✅ OVERALL */}
//           {aiInsights?.overall && (
//             <div style={{ background: "#ddd6fe", padding: "15px", marginTop: "20px" }}>
//               <p>Overall Score: {aiInsights.overall.percentage}%</p>
//               <p>🧠 {aiInsights.overall.tip}</p>
//             </div>
//           )}

//           <input
//             value={gmail}
//             onChange={(e) => setGmail(e.target.value)}
//             placeholder="Email"
//           />

//           <button onClick={generateHtmlContent}>
//             {sending ? "Sending..." : "Send Email"}
//           </button>

//           <button onClick={changeSubmitted}>
//             Create New Quiz
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default QuestionRenderingPage;

import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Pie, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import getServerUrl from "../utils/getServerUrl";

ChartJS.register(ArcElement, Tooltip, Legend);

const QuestionRenderingPage = ({ questionArr, changeSubmitted }) => {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [subjectiveAnswers, setSubjectiveAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [gmail, setGmail] = useState("");
  const [sending, setSending] = useState(false);
  const [chart, setChart] = useState({ right: 0, wrong: 0, notAnswered: 0 });
  const [aiInsights, setAiInsights] = useState(null);

  const handleOptionChange = (i, option) => {
    setSelectedAnswers({ ...selectedAnswers, [i]: option });
  };

  const handleSubjectiveChange = (i, val) => {
    setSubjectiveAnswers({ ...subjectiveAnswers, [i]: val });
  };

  // ================= RESULT CALC =================
  const calculateResults = async () => {
    let right = 0;
    let wrong = 0;
    let notAnswered = 0;
    let hasSubjective = false;

    questionArr.forEach((q, i) => {
      if (q.type === "mcq") {
        if (selectedAnswers[i] === q.answer) right++;
        else if (selectedAnswers[i]) wrong++;
        else notAnswered++;
      } else {
        hasSubjective = true;
        if (subjectiveAnswers[i]?.trim()) right++;
        else notAnswered++;
      }
    });

    setChart({ right, wrong, notAnswered });
    setShowResults(true);

    // ===== AI CALL =====
    if (hasSubjective) {
      try {
        const apiKey = import.meta.env.VITE_GROQ_API_KEY;

        const payload = questionArr.map((q, i) => ({
          question: q.question,
          answer: subjectiveAnswers[i] || "",
        }));
console.log("Payload for AI Evaluation:", payload);
const prompt = `
You are a teacher.

Evaluate answers based on:
1. Accuracy
2. Completeness
3. Key concepts

Important instructions:
- Accept synonymous or equivalent correct answers (e.g., "a tag" = "<a>" = anchor tag).
- Do NOT mark correct answers wrong due to wording differences.
- Only reduce marks if concept is missing, incorrect, or misleading.
- Prefer standard HTML knowledge (e.g., <a> is correct for hyperlinks; <link> is NOT for clickable links).
- Accept both HTML attributes and CSS where appropriate, but do not penalize valid basic answers.

Provide short, clear tips for each question. Overall tip can be slightly longer.

Rules:
- Fully correct + clear → 90–100%
- Correct but slightly incomplete → 70–89%
- Partially correct → 40–69%
- Mostly incorrect → 10–39%
- Completely wrong → 0–9%

Output format:

{
  "questions": [
    {
      "question": "string",
      "percentage": number,
      "tip": "string"
    }
  ],
  "overall": {
    "percentage": number,
    "tip": "string"
  }
}

Also fix any incorrect reasoning in tips.

Return ONLY JSON (no code, no explanation).

Input:
${JSON.stringify(payload)}
`;

        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
       body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.3
          })
      });
        console.log("AI API Response Status:", res);
        const data = await res.json();
        console.log("Full AI Response:", data);
        let text = data?.choices?.[0]?.message?.content;
    console.log("Raw AI Response:", text);
        text = text.replace(/```json/g, "").replace(/```/g, "");

        const parsed = JSON.parse(text);
        console.log("Parsed AI Insights:", parsed);
        setAiInsights(parsed);

      } catch (err) {
        console.error(err);
        toast.error("AI evaluation failed");
      }
    }
  };


  // ================= EMAIL =================
  const generateHtmlContent = async () => {
    setSending(true);
    try {
      await axios.post(`${getServerUrl()}/htmlContent`, {
        htmlContent: "<h2>Report</h2>",
        gmail,
      });
      toast.success("Sent!");
    } catch {
      toast.error("Failed");
    }
    setSending(false);
  };

  // ================= PIE (MCQ) =================
  const PieChart = () => (
    <div className="h-64">
      <Pie
        data={{
          labels: ["Correct", "Wrong", "Skipped"],
          datasets: [
            {
              data: [chart.right, chart.wrong, chart.notAnswered],
              backgroundColor: ["#00D100", "#EF4444", "#E5E7EB"],
              borderWidth: 0,
            },
          ],
        }}
      />
    </div>
  );

  // ================= CIRCULAR SCORE =================
  const CircularScore = ({ percentage }) => (
    <div className="relative h-40 w-40 mx-auto">
      <Doughnut
        data={{
          datasets: [
            {
              data: [percentage, 100 - percentage],
              backgroundColor: ["#4F46E5", "#E5E7EB"],
              borderWidth: 0,
              cutout: "75%",
            },
          ],
        }}
        options={{
          plugins: { tooltip: { enabled: false } },
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-black">
          {percentage}%
        </span>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <ToastContainer />

      {!showResults ? (
        // ================= QUIZ =================
        <div className="space-y-6">
          {questionArr.map((q, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-3xl border shadow-sm"
            >
              <p className="font-bold mb-3">
                Q{i + 1}. {q.question}
              </p>

              {q.type === "mcq" ? (
                Object.entries(q.options).map(([k, v]) => (
                  <label
                    key={k}
                    className={`block p-3 rounded-xl border mb-2 cursor-pointer ${
                      selectedAnswers[i] === k
                        ? "bg-indigo-50 border-indigo-500"
                        : ""
                    }`}
                  >
                    <input
                      type="radio"
                      checked={selectedAnswers[i] === k}
                      onChange={() => handleOptionChange(i, k)}
                    />
                    <span className="ml-2">
                      {k}. {v}
                    </span>
                  </label>
                ))
              ) : (
                <textarea
                  className="w-full border rounded-xl p-3"
                  placeholder="Write your answer..."
                  value={subjectiveAnswers[i] || ""}
                  onChange={(e) =>
                    handleSubjectiveChange(i, e.target.value)
                  }
                />
              )}
            </div>
          ))}

          <button
            onClick={calculateResults}
            className="w-full bg-black text-white p-4 rounded-xl"
          >
            Submit
          </button>
        </div>
      ) : (
        // ================= RESULTS =================
        <div className="space-y-8">

          {/* ===== MCQ PIE ===== */}
          <div className="bg-white p-6 rounded-3xl shadow">
            <h2 className="text-xl font-bold text-center mb-4">
              Performance
            </h2>
            <PieChart />
          </div>

          {/* ===== SUBJECTIVE SCORE ===== */}
          {aiInsights?.overall && (
            <div className="bg-white p-8 rounded-3xl shadow text-center">
              <h2 className="text-xl font-bold mb-4">
                Writing Score
              </h2>

              <CircularScore
                percentage={aiInsights.overall.percentage}
              />

              <p className="mt-4 text-gray-600">
                🧠 {aiInsights.overall.tip}
              </p>
            </div>
          )}

          {/* ===== REVIEW ===== */}
          {questionArr.map((q, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border">
              <p className="font-bold">
                Q{i + 1}. {q.question}
              </p>

              {q.type === "mcq" ? (
                <>
                  <p>
                    Your:{" "}
                    {selectedAnswers[i]
                      ? `${selectedAnswers[i]}`
                      : "Skipped"}
                  </p>
                  <p>Correct: {q.answer}</p>
                </>
              ) : (
                <>
                  <p>Your: {subjectiveAnswers[i]}</p>

                  {aiInsights?.questions?.[i] && (
                    <div className="bg-indigo-50 p-3 rounded-xl mt-2">
                      <p>
                        Score:{" "}
                        {aiInsights.questions[i].percentage}%
                      </p>
                      <p>
                        💡 {aiInsights.questions[i].tip}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}

          {/* ===== EMAIL ===== */}
          <div className="bg-black p-6 rounded-3xl text-white space-y-4">
            <input
              value={gmail}
              onChange={(e) => setGmail(e.target.value)}
              placeholder="Email"
              className="w-full p-3 rounded text-black"
            />

            <button
              onClick={generateHtmlContent}
              className="w-full bg-indigo-600 p-3 rounded"
            >
              {sending ? "Sending..." : "Send Email"}
            </button>

            <button
              onClick={() => changeSubmitted(false)}
              className="w-full text-sm"
            >
              Create New Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionRenderingPage;