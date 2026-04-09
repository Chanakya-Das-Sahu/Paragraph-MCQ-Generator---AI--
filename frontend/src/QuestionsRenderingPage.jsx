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

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
      <ToastContainer />

      {!showResults ? (
        // ================= QUIZ UI (EXACT MATCH) =================
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

    {/* ✅ MCQ UI (exact like your first code) */}
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
      /* ✅ SUBJECTIVE (UNCHANGED - EXACT SAME AS YOUR OLD UI) */
      <textarea
        value={subjectiveAnswers[i] || ""}
        onChange={(e) =>
          handleSubjectiveChange(i, e.target.value)
        }
        className="w-full border rounded-xl p-3"
        placeholder="Write your answer..."
      />
    )}
  </div>
))}

          <div className="fixed bottom-8 left-1/2 -translate-x-1/2">
            <button
              onClick={calculateResults}
              className="bg-[#111827] text-white py-4 px-12 rounded-2xl font-black shadow-2xl"
            >
              Finalize Answers
            </button>
          </div>
        </div>
      ) : (
        // ================= RESULTS UI =================
        <div className="space-y-8 pb-20">

          {/* PERFORMANCE */}
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
          / {questionArr.length}
        </span>
      </p>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      
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
          : "bg-white p-5 rounded-2xl border"
      }
    >
      <p className="font-bold text-[#1F2937] mb-2">
        Q{i + 1}: {q.question}
      </p>

      {/* ✅ MCQ UPDATED UI */}
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
        /* ✅ SUBJECTIVE (UNCHANGED) */
        <>
          <p>Your: {subjectiveAnswers[i]}</p>

          {aiInsights?.questions?.[i] && (
            <div className="bg-indigo-50 p-3 rounded-xl mt-2">
              <p>
                Score: {aiInsights.questions[i].percentage}%
              </p>
              <p>💡 {aiInsights.questions[i].tip}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
})}
          </div>

          {/* EMAIL */}
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