// import React, { useState } from "react";
// import axios from "axios";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { Pie, Doughnut } from "react-chartjs-2";
// import {
//   Chart as ChartJS,
//   ArcElement,
//   Tooltip,
//   Legend,
// } from "chart.js";
// import getServerUrl from "../utils/getServerUrl";

// ChartJS.register(ArcElement, Tooltip, Legend);

// const QuestionRenderingPage = ({ questionArr, changeSubmitted }) => {
//   const [selectedAnswers, setSelectedAnswers] = useState({});
//   const [subjectiveAnswers, setSubjectiveAnswers] = useState({});
//   const [showResults, setShowResults] = useState(false);
//   const [gmail, setGmail] = useState("");
//   const [sending, setSending] = useState(false);
//   const [chart, setChart] = useState({ right: 0, wrong: 0, notAnswered: 0 });
//   const [aiInsights, setAiInsights] = useState(null);

//   const handleOptionChange = (i, option) => {
//     setSelectedAnswers({ ...selectedAnswers, [i]: option });
//   };

//   const handleSubjectiveChange = (i, val) => {
//     setSubjectiveAnswers({ ...subjectiveAnswers, [i]: val });
//   };

//   // ================= RESULT =================
//   const calculateResults = async () => {
//     let right = 0;
//     let wrong = 0;
//     let notAnswered = 0;
//     let hasSubjective = false;

//     questionArr.forEach((q, i) => {
//       if (q.type === "mcq") {
//         if (selectedAnswers[i] === q.answer) right++;
//         else if (selectedAnswers[i]) wrong++;
//         else notAnswered++;
//       } else {
//         hasSubjective = true;
//         if (subjectiveAnswers[i]?.trim()) right++;
//         else notAnswered++;
//       }
//     });

//     setChart({ right, wrong, notAnswered });
//     setShowResults(true);

//     if (hasSubjective) {
//       try {
//         const apiKey = import.meta.env.VITE_GROQ_API_KEY;

//         const payload = questionArr.map((q, i) => ({
//           question: q.question,
//           answer: subjectiveAnswers[i] || "",
//         }));

//        const prompt = `
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
// - In case of no answer, assign 0% 

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
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${apiKey}`,
//           },
//           body: JSON.stringify({
//             model: "llama-3.1-8b-instant",
//             messages: [{ role: "user", content: prompt + JSON.stringify(payload) }],
//           }),
//         });

//         const data = await res.json();
//         let text = data?.choices?.[0]?.message?.content;
//         text = text.replace(/```json/g, "").replace(/```/g, "");
//         setAiInsights(JSON.parse(text));
//       } catch {
//         toast.error("AI evaluation failed");
//       }
//     }
//   };

//   //  html content for mcq and subjective results

//       const generateMCQHtml = () => {
//       return`
// <div style="background-color: #f4f7ff; padding: 20px; font-family: 'Segoe UI', Tahoma, sans-serif;">
//     <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
        
//         <div style="background: #4F46E5; padding: 30px; text-align: center;">
//             <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Quiz Report</h1>
//             <p style="color: #e0e7ff; margin-top: 10px;">Results Overview</p>
//         </div>
        
//         <div style="padding: 20px;">
//             <table width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 30px; border-bottom: 1px solid #f0f0f0; padding-bottom: 20px;">
//                 <tr>
//                     <td align="center" style="width: 33%;">
//                         <span style="display: block; font-size: 20px; font-weight: bold; color: #00D100;">${chart.right}</span>
//                         <span style="font-size: 10px; color: #6b7280; text-transform: uppercase;">Correct</span>
//                     </td>
//                     <td align="center" style="width: 33%;">
//                         <span style="display: block; font-size: 20px; font-weight: bold; color: #ef4444;">${chart.wrong}</span>
//                         <span style="font-size: 10px; color: #6b7280; text-transform: uppercase;">Wrong</span>
//                     </td>
//                     <td align="center" style="width: 33%;">
//                         <span style="display: block; font-size: 20px; font-weight: bold; color: #9ca3af;">${chart.notAnswered}</span>
//                         <span style="font-size: 10px; color: #6b7280; text-transform: uppercase;">Skipped</span>
//                     </td>
//                 </tr>
//             </table>

//             <h2 style="font-size: 18px; color: #1f2937; margin-bottom: 20px;">Detailed Review</h2>

//             ${questionArr
//               .map((item, index) => {
//                 const userSelectionKey = selectedAnswers[index];
//                 const isAnswered = !!userSelectionKey;
//                 const isCorrect = userSelectionKey === item.answer;

//                 const correctText = item.options[item.answer];
//                 const userText = isAnswered
//                   ? item.options[userSelectionKey]
//                   : "Not Answered";

//                 // --- DYNAMIC STYLING LOGIC ---
//                 let bgColor = "#f9fafb"; // Default Gray for Skipped
//                 let borderColor = "#d1d5db";
//                 let statusIcon = "⚪";

//                 if (isAnswered) {
//                   if (isCorrect) {
//                     bgColor = "#f0fdf4"; // Green
//                     borderColor = "#22c55e";
//                     statusIcon = "✅";
//                   } else {
//                     bgColor = "#fef2f2"; // Red
//                     borderColor = "#ef4444";
//                     statusIcon = "❌";
//                   }
//                 }

//                 return `
//                 <div style="margin-bottom: 20px; padding: 15px; border-radius: 12px; background-color: ${bgColor}; border-left: 5px solid ${borderColor};">
//                     <p style="margin: 0 0 10px 0; font-weight: 600; color: #1f2937; font-size: 16px;">
//                         ${index + 1}. ${item.question}
//                     </p>
//                     <div style="font-size: 14px; color: #374151;">
//                         <p style="margin: 5px 0;">
//                             <strong>Your Choice:</strong> ${isAnswered ? `(${userSelectionKey}) ${userText}` : `<i style="color: #6b7280;">Skipped</i>`} 
//                             ${statusIcon}
//                         </p>
//                         ${
//                           !isCorrect
//                             ? `
//                             <p style="margin: 5px 0; color: #1f2937;">
//                                 <strong style="color: #4F46E5;">Correct Answer:</strong> (${item.answer}) ${correctText}
//                             </p>
//                         `
//                             : ""
//                         }
//                     </div>
//                 </div>`;
//               })
//               .join("")}

//             <div style="background: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #f0f0f0; margin-top: 20px;">
//                 <p style="font-size: 12px; color: #9ca3af; margin: 0;">Generated by Quiz App &bull; ${new Date().toLocaleDateString("en-IN")}</p>
//             </div>
//         </div>
//     </div>
// </div>`;}

// const generateSubjectiveHtml = () => {
//   return `
// <div style="background-color:#f4f7ff;padding:20px;font-family:Segoe UI;">
//   <div style="max-width:600px;margin:auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 15px rgba(0,0,0,0.05);">

//     <div style="background:#4F46E5;padding:30px;text-align:center;">
//       <h1 style="color:#fff;margin:0;">Subjective Report</h1>
//       <p style="color:#e0e7ff;">AI Evaluation</p>
//     </div>

//     <div style="padding:20px;">
      
//       <!-- Overall Score -->
//       ${
//         aiInsights?.overall
//           ? `
//         <div style="text-align:center;margin-bottom:20px;">
//           <h2 style="margin:0;color:#1f2937;">
//             Score: ${aiInsights.overall.percentage}%
//           </h2>
//           <p style="color:#6b7280;">
//             🧠 ${aiInsights.overall.tip}
//           </p>
//         </div>
//       `
//           : ""
//       }

//       <h2 style="font-size:18px;color:#1f2937;margin-bottom:20px;">
//         Detailed Review
//       </h2>

//       ${questionArr
//         .map((q, i) => {
//           if (q.type === "mcq") return "";

//           const userAns = subjectiveAnswers[i]?.trim()
//             ? subjectiveAnswers[i]
//             : "Skipped";

//           const insight = aiInsights?.questions?.[i];

//           return `
//           <div style="margin-bottom:20px;padding:15px;border-radius:12px;background:#f9fafb;border-left:5px solid #6366F1;">
            
//             <p style="font-weight:600;color:#1f2937;">
//               ${i + 1}. ${q.question}
//             </p>

//             <p style="margin:8px 0;">
//               <strong>Your Answer:</strong> ${userAns}
//             </p>

//             ${
//               insight
//                 ? `
//               <p style="margin:5px 0;">
//                 <strong>Score:</strong> ${insight.percentage}%
//               </p>
//               <p style="color:#4F46E5;">
//                 💡 ${insight.tip}
//               </p>
//             `
//                 : ""
//             }

//           </div>`;
//         })
//         .join("")}

//       <div style="text-align:center;margin-top:20px;color:#9ca3af;font-size:12px;">
//         Generated by Quiz App • ${new Date().toLocaleDateString("en-IN")}
//       </div>

//     </div>
//   </div>
// </div>
// `;
// };

//   // ================= EMAIL =================
// const generateHtmlContent = async () => {
//   setSending(true);

//   const hasMCQ = questionArr.some(q => q.type === "mcq");
//   const hasSubjective = questionArr.some(q => q.type !== "mcq");

//   let html = "";

//   if (hasMCQ && !hasSubjective) {
//     html = generateMCQHtml();   // ✅ your existing HTML
//   } else if (!hasMCQ && hasSubjective) {
//     html = generateSubjectiveHtml(); // ✅ new one
//   } else {
//     // ✅ mixed case (optional)
//     html = generateMCQHtml() + generateSubjectiveHtml();
//   }

//   try {
//     await axios.post(`${getServerUrl()}/htmlContent`, {
//       htmlContent: html,
//       gmail,
//     });
//     toast.success("Result Sent");
//   } catch {
//     toast.error("Failed");
//   }

//   setSending(false);
// };

//  // --- CHART COMPONENT ---
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

//   // ================= SUBJECTIVE CIRCLE =================
//   const CircularScore = ({ percentage }) => (
//     <div className="relative h-40 w-40">
//       <Doughnut
//         data={{
//           datasets: [
//             {
//               data: [percentage, 100 - percentage],
//               backgroundColor: ["#4F46E5", "#E5E7EB"],
//               borderWidth: 0,
//               cutout: "75%",
//             },
//           ],
//         }}
//         options={{ plugins: { tooltip: { enabled: false } } }}
//       />
//       <div className="absolute inset-0 flex items-center justify-center">
//         <span className="text-2xl font-black">{percentage}%</span>
//       </div>
//     </div>
//   );

//   return (
//     <div className="max-w-3xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
//       <ToastContainer />

//       {!showResults ? (
//         // ================= QUIZ UI (EXACT MATCH) =================
//         <div className="space-y-6 pb-20">
//           <div className="text-center mb-8">
//             <h1 className="text-3xl font-black text-[#111827]">
//               Knowledge Check
//             </h1>
//             <p className="text-gray-500 font-medium">
//               Select the best answer for each question.
//             </p>
//           </div>

//           {questionArr.map((q, i) => (
//   <div
//     key={i}
//     className="bg-white border border-[#E0E7FF] p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow"
//   >
//     <div className="flex items-start gap-4 mb-4">
//       <span className="bg-[#EEF2FF] text-[#4F46E5] font-black px-3 py-1 rounded-lg text-sm">
//         Q{i + 1}
//       </span>
//       <h2 className="font-bold text-[#1F2937] text-lg leading-snug">
//         {q.question}
//       </h2>
//     </div>

//     {/* ✅ MCQ UI (exact like your first code) */}
//     {q.type === "mcq" ? (
//       <div className="grid grid-cols-1 gap-3">
//         {Object.entries(q.options).map(([key, value]) => (
//           <label
//             key={key}
//             className={`group flex items-center p-4 rounded-2xl border-2 cursor-pointer transition-all 
//             ${
//               selectedAnswers[i] === key
//                 ? "border-[#4F46E5] bg-[#EEF2FF]"
//                 : "border-[#F3F4F6] hover:border-[#E0E7FF] hover:bg-[#F9FAFB]"
//             }`}
//           >
//             <input
//               type="radio"
//               name={`question-${i}`}
//               checked={selectedAnswers[i] === key}
//               onChange={() => handleOptionChange(i, key)}
//               className="w-5 h-5 text-[#4F46E5]"
//             />
//             <span
//               className={`ml-4 font-semibold ${
//                 selectedAnswers[i] === key
//                   ? "text-[#4F46E5]"
//                   : "text-gray-600"
//               }`}
//             >
//               <span className="opacity-50 mr-2">{key}.</span> {value}
//             </span>
//           </label>
//         ))}
//       </div>
//     ) : (
//       /* ✅ SUBJECTIVE (UNCHANGED - EXACT SAME AS YOUR OLD UI) */
//       <textarea
//         value={subjectiveAnswers[i] || ""}
//         onChange={(e) =>
//           handleSubjectiveChange(i, e.target.value)
//         }
//         className="w-full border rounded-xl p-3"
//         placeholder="Write your answer..."
//       />
//     )}
//   </div>
// ))}

//           <div className="fixed bottom-8 left-1/2 -translate-x-1/2">
//             <button
//               onClick={calculateResults}
//               className="bg-[#111827] text-white py-4 px-12 rounded-2xl font-black shadow-2xl"
//             >
//               Finalize Answers
//             </button>
//           </div>
//         </div>
//       ) : (
//         // ================= RESULTS UI =================
//         <div className="space-y-8 pb-20">

//           {/* PERFORMANCE */}
//           <div className="bg-white rounded-[2.5rem] border p-8 shadow-xl">
//             <h3 className="text-2xl font-black text-center mb-6">
//               Your Performance
//             </h3>

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

//           {/* ===== SUBJECTIVE SCORE ===== */}
//           {aiInsights?.overall && (
//             <div className="bg-white my-4 p-8 rounded-3xl shadow text-center flex  flex-col justify-center items-center">
//               <h2 className="text-2 font-bold mb-4">
//                 Overall Score
//               </h2>

//               <CircularScore
//                 percentage={aiInsights.overall.percentage}
//               />

//               <p className="mt-4 text-gray-600">
//                 🧠 {aiInsights.overall.tip}
//               </p>
//             </div>
//           )}

//           {/* ===== REVIEW ===== */}
//           {questionArr.map((q, i) => {
//   const isMCQ = q.type === "mcq";
//   const isCorrect = selectedAnswers[i] === q.answer;
//   const skipped = !selectedAnswers[i];

//   return (
//     <div
//       key={i}
//       className={
//         isMCQ
//           ? `p-6 rounded-3xl border-2 my-3 ${
//               skipped
//                 ? "bg-gray-50 border-gray-200"
//                 : isCorrect
//                 ? "bg-white border-green-200"
//                 : "bg-white border-red-200"
//             }`
//           : "bg-white p-5 rounded-2xl border my-4"
//       }
//     >
//       <p className="font-bold text-[#1F2937] mb-2">
//         Q{i + 1}: {q.question}
//       </p>

//       {/* ✅ MCQ UPDATED UI */}
//       {isMCQ ? (
//         <div className="text-sm space-y-1 ">
//           <p
//             className={`${
//               skipped
//                 ? "text-gray-500"
//                 : isCorrect
//                 ? "text-green-600 font-bold"
//                 : "text-red-500 font-bold"
//             }`}
//           >
//             Your Answer:{" "}
//             {selectedAnswers[i]
//               ? `${selectedAnswers[i]}. ${q.options[selectedAnswers[i]]}`
//               : "Skipped"}
//           </p>

//           <p className="text-indigo-600 font-bold">
//             Correct: {q.answer}. {q.options[q.answer]}
//           </p>
//         </div>
//       ) : (
//         /* ✅ SUBJECTIVE (UNCHANGED) */
//         <>
//           <p>
//   Your:{" "}
//   {aiInsights?.questions?.[i]?.percentage === 0
//     ? "Skipped"
//     : subjectiveAnswers[i]}
// </p>

//           {aiInsights?.questions?.[i] && (
//             <div className="bg-indigo-50 p-3 rounded-xl mt-2">
//               <p>
//                 Score: {aiInsights.questions[i].percentage}%
//               </p>
//               <p>💡 {aiInsights.questions[i].tip}</p>
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// })}
//           </div>

//           {/* EMAIL */}
//         <div className="bg-[#111827] p-8 rounded-[2rem] text-white space-y-6 shadow-2xl">
//             <h4 className="text-center font-bold text-indigo-300 uppercase tracking-widest text-sm">
//               Save your report
//             </h4>
//             <div className="flex flex-col sm:flex-row gap-3">
//               <input
//                 type="email"
//                 placeholder="email@example.com"
//                 onChange={(e) => setGmail(e.target.value)}
//                 value={gmail}
//                 className="flex-1 bg-gray-800 border-none rounded-xl p-4 text-white focus:ring-2 focus:ring-indigo-500"
//               />
//               <button
//                 onClick={generateHtmlContent}
//                 disabled={!gmail.includes("@") || sending}
//                 className="bg-[#4F46E5] hover:bg-[#6366F1] disabled:bg-gray-700 text-white py-4 px-8 rounded-xl font-bold transition-all"
//               >
//                 {sending ? "Sending..." : "Email Report"}
//               </button>
//             </div>
//             <button
//               onClick={() => changeSubmitted(false)}
//               className="w-full text-gray-400 hover:text-white text-xs font-bold transition-all uppercase tracking-widest pt-4 border-t border-white/10"
//             >
//               Create New Quiz
//             </button>
//           </div>
       
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
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const handleOptionChange = (i, option) => {
    setSelectedAnswers({ ...selectedAnswers, [i]: option });
  };

  const handleSubjectiveChange = (i, val) => {
    setSubjectiveAnswers({ ...subjectiveAnswers, [i]: val });
  };

  // Check if all questions are subjective
  const isAllSubjective = questionArr.every(q => q.type !== "mcq");
  const hasMixedQuestions = questionArr.some(q => q.type === "mcq") && questionArr.some(q => q.type !== "mcq");

  // ================= RESULT =================
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

    if (hasSubjective) {
      setIsLoadingAI(true);
      try {
        const apiKey = import.meta.env.VITE_GROQ_API_KEY;

        const payload = questionArr.map((q, i) => ({
          question: q.question,
          answer: subjectiveAnswers[i] || "",
        }));

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
- In case of no answer, assign 0% 

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
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [{ role: "user", content: prompt + JSON.stringify(payload) }],
          }),
        });

        const data = await res.json();
        let text = data?.choices?.[0]?.message?.content;
        text = text.replace(/```json/g, "").replace(/```/g, "");
        setAiInsights(JSON.parse(text));
      } catch {
        toast.error("AI evaluation failed");
      } finally {
        setIsLoadingAI(false);
      }
    }
  };

  //  html content for mcq and subjective results

  const generateMCQHtml = () => {
    return `
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
                        <span style="display: block; font-size: 20px; font-weight: bold; color: #00D100;">${chart.right}</span>
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
  };

  const generateSubjectiveHtml = () => {
    return `
<div style="background-color:#f4f7ff;padding:20px;font-family:Segoe UI;">
  <div style="max-width:600px;margin:auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 15px rgba(0,0,0,0.05);">

    <div style="background:#4F46E5;padding:30px;text-align:center;">
      <h1 style="color:#fff;margin:0;">Subjective Report</h1>
      <p style="color:#e0e7ff;">AI Evaluation</p>
    </div>

    <div style="padding:20px;">
      
      <!-- Overall Score -->
      ${
        aiInsights?.overall
          ? `
        <div style="text-align:center;margin-bottom:20px;">
          <h2 style="margin:0;color:#1f2937;">
            Score: ${aiInsights.overall.percentage}%
          </h2>
          <p style="color:#6b7280;">
            🧠 ${aiInsights.overall.tip}
          </p>
        </div>
      `
          : ""
      }

      <h2 style="font-size:18px;color:#1f2937;margin-bottom:20px;">
        Detailed Review
      </h2>

      ${questionArr
        .map((q, i) => {
          if (q.type === "mcq") return "";

          const userAns = subjectiveAnswers[i]?.trim()
            ? subjectiveAnswers[i]
            : "Skipped";

          const insight = aiInsights?.questions?.[i];

          return `
          <div style="margin-bottom:20px;padding:15px;border-radius:12px;background:#f9fafb;border-left:5px solid #6366F1;">
            
            <p style="font-weight:600;color:#1f2937;">
              ${i + 1}. ${q.question}
            </p>

            <p style="margin:8px 0;">
              <strong>Your Answer:</strong> ${userAns}
            </p>

            ${
              insight
                ? `
              <p style="margin:5px 0;">
                <strong>Score:</strong> ${insight.percentage}%
              </p>
              <p style="color:#4F46E5;">
                💡 ${insight.tip}
              </p>
            `
                : ""
            }

          </div>`;
        })
        .join("")}

      <div style="text-align:center;margin-top:20px;color:#9ca3af;font-size:12px;">
        Generated by Quiz App • ${new Date().toLocaleDateString("en-IN")}
      </div>

    </div>
  </div>
</div>
`;
  };

  // ================= EMAIL =================
  const generateHtmlContent = async () => {
    setSending(true);

    const hasMCQ = questionArr.some(q => q.type === "mcq");
    const hasSubjective = questionArr.some(q => q.type !== "mcq");

    let html = "";

    if (hasMCQ && !hasSubjective) {
      html = generateMCQHtml();
    } else if (!hasMCQ && hasSubjective) {
      html = generateSubjectiveHtml();
    } else {
      html = generateMCQHtml() + generateSubjectiveHtml();
    }

    try {
      await axios.post(`${getServerUrl()}/htmlContent`, {
        htmlContent: html,
        gmail,
      });
      toast.success("Result Sent");
    } catch {
      toast.error("Failed");
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
          backgroundColor: ["#00D100", "#EF4444", "#E5E7EB"],
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

  // ================= SUBJECTIVE CIRCLE =================
  const CircularScore = ({ percentage }) => (
    <div className="relative h-40 w-40">
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
        options={{ plugins: { tooltip: { enabled: false } } }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-black">{percentage}%</span>
      </div>
    </div>
  );

  // Loading Animation Component
  const LoadingAnimation = () => (
    <div className="fixed inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center space-y-6 max-w-md px-6">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl">🤖</span>
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-800">AI is Evaluating</h3>
        <p className="text-gray-600">
          Our AI is carefully analyzing your subjective answers. 
          This may take a few moments...
        </p>
        <div className="flex justify-center gap-1">
          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce delay-100"></div>
          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce delay-200"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
      <ToastContainer />
      
      {isLoadingAI && <LoadingAnimation />}

      {!showResults ? (
        // ================= QUIZ UI =================
        <div className="space-y-6 pb-20">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-[#111827]">
              Knowledge Check
            </h1>
            <p className="text-gray-500 font-medium">
              Select the best answer for each question.
            </p>
          </div>

          {questionArr.map((q, i) => (
            <div
              key={i}
              className="bg-white border border-[#E0E7FF] p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4 mb-4">
                <span className="bg-[#EEF2FF] text-[#4F46E5] font-black px-3 py-1 rounded-lg text-sm">
                  Q{i + 1}
                </span>
                <h2 className="font-bold text-[#1F2937] text-lg leading-snug">
                  {q.question}
                </h2>
              </div>

              {q.type === "mcq" ? (
                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(q.options).map(([key, value]) => (
                    <label
                      key={key}
                      className={`group flex items-center p-4 rounded-2xl border-2 cursor-pointer transition-all 
                      ${
                        selectedAnswers[i] === key
                          ? "border-[#4F46E5] bg-[#EEF2FF]"
                          : "border-[#F3F4F6] hover:border-[#E0E7FF] hover:bg-[#F9FAFB]"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${i}`}
                        checked={selectedAnswers[i] === key}
                        onChange={() => handleOptionChange(i, key)}
                        className="w-5 h-5 text-[#4F46E5]"
                      />
                      <span
                        className={`ml-4 font-semibold ${
                          selectedAnswers[i] === key
                            ? "text-[#4F46E5]"
                            : "text-gray-600"
                        }`}
                      >
                        <span className="opacity-50 mr-2">{key}.</span> {value}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <textarea
                  value={subjectiveAnswers[i] || ""}
                  onChange={(e) => handleSubjectiveChange(i, e.target.value)}
                  className="w-full border rounded-xl p-3"
                  placeholder="Write your answer..."
                  rows="4"
                />
              )}
            </div>
          ))}

          <div className="fixed bottom-8 left-1/2 -translate-x-1/2">
            <button
              onClick={calculateResults}
              className="bg-[#111827] text-white py-4 px-12 rounded-2xl font-black shadow-2xl hover:bg-gray-800 transition-colors"
            >
              Finalize Answers
            </button>
          </div>
        </div>
      ) : (
        // ================= RESULTS UI =================
        <div className="space-y-8 pb-20">
          {/* Only show pie chart and stats for non-subjective questions */}
          {!isAllSubjective && (
            <div className="bg-white rounded-[2.5rem] border p-8 shadow-xl">
              <h3 className="text-2xl font-black text-center mb-6">
                Your Performance
              </h3>

              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 w-full max-w-[280px]">
                  <PieChart />
                </div>

                <div className="flex-1 space-y-4 w-full">
                  {/* Total Score */}
                  <div className="bg-[#F9FAFB] p-4 rounded-2xl border border-[#E0E7FF]">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                      Total Score
                    </p>
                    <p className="text-4xl font-black text-[#1F2937]">
                      {chart.right}{" "}
                      <span className="text-xl text-gray-400">
                        / {questionArr.filter(q => q.type === "mcq").length}
                      </span>
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Correct */}
                    <div className="p-4 bg-green-50 rounded-2xl">
                      <p className="text-xs font-bold text-green-600 uppercase">
                        Correct
                      </p>
                      <p className="text-xl font-bold text-green-700">
                        {chart.right}
                      </p>
                    </div>

                    {/* Wrong */}
                    <div className="p-4 bg-red-50 rounded-2xl">
                      <p className="text-xs font-bold text-red-600 uppercase">
                        Wrong
                      </p>
                      <p className="text-xl font-bold text-red-700">
                        {chart.wrong}
                      </p>
                    </div>

                    {/* Skipped */}
                    <div className="p-4 bg-gray-50 rounded-2xl">
                      <p className="text-xs font-bold text-gray-600 uppercase">
                        Skipped
                      </p>
                      <p className="text-xl font-bold text-gray-700">
                        {chart.notAnswered}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Show doughnut chart for subjective overall score */}
          {aiInsights?.overall && (
            <div className="bg-white p-8 rounded-3xl shadow-xl text-center flex flex-col justify-center items-center">
              <h2 className="text-2xl font-bold mb-4">
                Overall Performance Score
              </h2>

              <CircularScore percentage={aiInsights.overall.percentage} />

              <p className="mt-4 text-gray-600 max-w-md">
                🧠 {aiInsights.overall.tip}
              </p>
            </div>
          )}

          {/* ===== REVIEW SECTION ===== */}
          <div className="bg-white rounded-3xl border p-6 shadow-sm">
            <h3 className="text-xl font-bold mb-6">Detailed Review</h3>
            
            {questionArr.map((q, i) => {
              const isMCQ = q.type === "mcq";
              const isCorrect = selectedAnswers[i] === q.answer;
              const skipped = !selectedAnswers[i];

              return (
                <div
                  key={i}
                  className={
                    isMCQ
                      ? `p-6 rounded-3xl border-2 my-3 ${
                          skipped
                            ? "bg-gray-50 border-gray-200"
                            : isCorrect
                            ? "bg-white border-green-200"
                            : "bg-white border-red-200"
                        }`
                      : "bg-gray-50 p-5 rounded-2xl border my-4"
                  }
                >
                  <p className="font-bold text-[#1F2937] mb-2">
                    Q{i + 1}: {q.question}
                  </p>

                  {isMCQ ? (
                    <div className="text-sm space-y-1">
                      <p
                        className={`${
                          skipped
                            ? "text-gray-500"
                            : isCorrect
                            ? "text-green-600 font-bold"
                            : "text-red-500 font-bold"
                        }`}
                      >
                        Your Answer:{" "}
                        {selectedAnswers[i]
                          ? `${selectedAnswers[i]}. ${q.options[selectedAnswers[i]]}`
                          : "Skipped"}
                      </p>

                      <p className="text-indigo-600 font-bold">
                        Correct: {q.answer}. {q.options[q.answer]}
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="mb-3 text-gray-700">
                        <strong>Your Answer:</strong>{" "}
                        {subjectiveAnswers[i]?.trim() || "Skipped"}
                      </p>

                      {aiInsights?.questions?.[i] && (
                        <div className="bg-indigo-50 p-4 rounded-xl mt-2">
                          <p className="font-semibold text-indigo-900 mb-1">
                            Score: {aiInsights.questions[i].percentage}%
                          </p>
                          <p className="text-indigo-700">
                            💡 {aiInsights.questions[i].tip}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* EMAIL SECTION */}
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

export default QuestionRenderingPage;