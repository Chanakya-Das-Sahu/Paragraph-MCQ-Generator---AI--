import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
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
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

ChartJS.register(ArcElement, Tooltip, Legend);

// Memoized PieChart Component
const PieChart = React.memo(({ chart, isChatOpen, isFullScreen }) => {
  const chartRef = useRef(null);
  
  const options = useMemo(() => ({
    plugins: {
      legend: {
        position: "bottom",
        labels: { color: "#4B5563", font: { weight: "600" } },
      },
    },
    maintainAspectRatio: false,
    responsive: true,
  }), []);

  const data = useMemo(() => ({
    labels: ["Correct", "Wrong", "Skipped"],
    datasets: [
      {
        data: [chart.right, chart.wrong, chart.notAnswered],
        backgroundColor: ["#00D100", "#EF4444", "#E5E7EB"],
        borderWidth: 0,
      },
    ],
  }), [chart.right, chart.wrong, chart.notAnswered]);

  useEffect(() => {
    if (chartRef.current) {
      const timer = setTimeout(() => {
        if (chartRef.current && chartRef.current.chartInstance) {
          chartRef.current.chartInstance.resize();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isChatOpen, isFullScreen]);

  return (
    <div className={`${!isFullScreen && isChatOpen ? 'h-48' : 'h-64'} w-full transition-all duration-300`}>
      <Pie ref={chartRef} data={data} options={options} />
    </div>
  );
});

// Memoized CircularScore Component
const CircularScore = React.memo(({ percentage }) => {
  const chartRef = useRef(null);
  
  const data = useMemo(() => ({
    datasets: [
      {
        data: [percentage, 100 - percentage],
        backgroundColor: ["#4F46E5", "#E5E7EB"],
        borderWidth: 0,
        cutout: "75%",
      },
    ],
  }), [percentage]);

  const options = useMemo(() => ({
    plugins: { tooltip: { enabled: false } },
    responsive: true,
    maintainAspectRatio: true,
  }), []);

  return (
    <div className="relative h-40 w-40">
      <Doughnut ref={chartRef} data={data} options={options} />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-black">{percentage}%</span>
      </div>
    </div>
  );
});

const QuestionRenderingPage = ({ questionArr, changeSubmitted }) => {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [subjectiveAnswers, setSubjectiveAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [gmail, setGmail] = useState("");
  const [sending, setSending] = useState(false);
  const [chart, setChart] = useState({ right: 0, wrong: 0, notAnswered: 0 });
  const [aiInsights, setAiInsights] = useState(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  // Chatbot states
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const chatMessagesEndRef = useRef(null);
  const chatInputRef = useRef(null);
  const chatContainerRef = useRef(null);

  const handleOptionChange = useCallback((i, option) => {
    setSelectedAnswers(prev => ({ ...prev, [i]: option }));
  }, []);

  const handleSubjectiveChange = useCallback((i, val) => {
    setSubjectiveAnswers(prev => ({ ...prev, [i]: val }));
  }, []);

  // Check if all questions are subjective
  const isAllSubjective = questionArr.every(q => q.type !== "mcq");

  // Handle scroll event for chat container
  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      const handleScroll = () => {
        const { scrollTop, scrollHeight, clientHeight } = chatContainer;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
        setShowScrollButton(!isNearBottom);
      };

      chatContainer.addEventListener('scroll', handleScroll);
      return () => chatContainer.removeEventListener('scroll', handleScroll);
    }
  }, [isChatOpen]);

  // Auto-scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatMessagesEndRef.current && chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

      if (isNearBottom) {
        chatMessagesEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [chatMessages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isChatOpen && chatInputRef.current) {
      chatInputRef.current.focus();
    }
  }, [isChatOpen]);

  const scrollToBottom = useCallback(() => {
    if (chatMessagesEndRef.current) {
      chatMessagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  // ================= CHATBOT FUNCTIONS =================
  const toggleQuestionSelection = useCallback((index) => {
    if (selectedQuestionIndex === index) {
      setSelectedQuestionIndex(null);
      toast.info("Question deselected");
    } else {
      setSelectedQuestionIndex(index);
      toast.success(`Question ${index + 1} selected`);
      if (!isChatOpen) {
        setIsChatOpen(true);
      }
    }
  }, [selectedQuestionIndex, isChatOpen]);

  const buildChatContext = useCallback(() => {
    let context = "Available Questions and Content:\n\n";

    questionArr.forEach((q, i) => {
      context += `Q${i + 1}: ${q.question}\n`;
      if (q.type === "mcq") {
        context += `Options: ${Object.entries(q.options).map(([k, v]) => `${k}: ${v}`).join(", ")}\n`;
        context += `Correct Answer: ${q.answer}. ${q.options[q.answer]}\n`;
      } else {
        context += `Type: Subjective Question\n`;
      }
      context += "\n";
    });

    if (selectedQuestionIndex !== null) {
      const selectedQ = questionArr[selectedQuestionIndex];
      context = `[SELECTED QUESTION FOR CONTEXT]\n`;
      context += `Question: ${selectedQ.question}\n`;
      if (selectedQ.type === "mcq") {
        context += `Options: ${Object.entries(selectedQ.options).map(([k, v]) => `${k}: ${v}`).join(", ")}\n`;
        context += `Correct Answer: ${selectedQ.answer}. ${selectedQ.options[selectedQ.answer]}\n`;
      }
      context += `\n---\n\n${context}`;
    }

    return context;
  }, [questionArr, selectedQuestionIndex]);

  const handleSendMessage = useCallback(async () => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();
    setChatInput("");

    setChatMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsChatLoading(true);
    
    setTimeout(() => {
      scrollToBottom();
    }, 100);

    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;

      if (!apiKey) {
        throw new Error("Groq API Key not found");
      }

      const context = buildChatContext();

      const systemPrompt = `You are a helpful AI tutor assistant. You have access to the following quiz questions and content:

${context}

You can answer questions about:
1. The specific content of any question (especially if the user has selected/tagged a question)
2. General topics related to the subject matter of these questions
3. Explain concepts, provide additional examples, or clarify doubts

Guidelines:
- If the user references a specific question (like "Q1" or "this question"), refer to the actual question content
- If no specific question is mentioned, provide general helpful information related to the topics in the questions
- Keep responses concise but informative
- Be encouraging and supportive
- If asked about something not covered in the context, you can still help based on your knowledge
- You can use markdown formatting in your responses for better readability (bold, italic, code blocks, lists, etc.)

Current selected question: ${selectedQuestionIndex !== null ? `Q${selectedQuestionIndex + 1}: ${questionArr[selectedQuestionIndex].question}` : "None selected"}`;

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            { role: "system", content: systemPrompt },
            ...chatMessages.map(msg => ({ role: msg.role, content: msg.content })),
            { role: "user", content: userMessage }
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      const data = await response.json();
      const aiResponse = data?.choices?.[0]?.message?.content || "Sorry, I couldn't process that request.";

      setChatMessages(prev => [...prev, { role: "assistant", content: aiResponse }]);
      
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    } catch (error) {
      console.error("Chat error:", error);
      setChatMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again."
      }]);
      toast.error("Failed to get response");
      
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    } finally {
      setIsChatLoading(false);
    }
  }, [chatInput, chatMessages, selectedQuestionIndex, questionArr, buildChatContext, scrollToBottom]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

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
  const generateMCQHtml = useCallback(() => {
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

          let bgColor = "#f9fafb";
          let borderColor = "#d1d5db";
          let statusIcon = "⚪";

          if (isAnswered) {
            if (isCorrect) {
              bgColor = "#f0fdf4";
              borderColor = "#22c55e";
              statusIcon = "✅";
            } else {
              bgColor = "#fef2f2";
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
                        ${!isCorrect
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
  }, [chart, questionArr, selectedAnswers]);

  const generateSubjectiveHtml = useCallback(() => {
    return `
<div style="background-color:#f4f7ff;padding:20px;font-family:Segoe UI;">
  <div style="max-width:600px;margin:auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 15px rgba(0,0,0,0.05);">

    <div style="background:#4F46E5;padding:30px;text-align:center;">
      <h1 style="color:#fff;margin:0;">Subjective Report</h1>
      <p style="color:#e0e7ff;">AI Evaluation</p>
    </div>

    <div style="padding:20px;">
      
      ${aiInsights?.overall
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

            ${insight
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
  }, [aiInsights, questionArr, subjectiveAnswers]);

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

  // Markdown Component for Chat Messages
  const MarkdownMessage = React.memo(({ content }) => (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <SyntaxHighlighter
              style={vscDarkPlus}
              language={match[1]}
              PreTag="div"
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
        p({ children }) {
          return <p className="text-sm whitespace-pre-wrap mb-2">{children}</p>;
        },
        ul({ children }) {
          return <ul className="list-disc list-inside text-sm space-y-1 mb-2">{children}</ul>;
        },
        ol({ children }) {
          return <ol className="list-decimal list-inside text-sm space-y-1 mb-2">{children}</ol>;
        },
        li({ children }) {
          return <li className="text-sm">{children}</li>;
        },
        strong({ children }) {
          return <strong className="font-bold">{children}</strong>;
        },
        em({ children }) {
          return <em className="italic">{children}</em>;
        },
        blockquote({ children }) {
          return <blockquote className="border-l-4 border-indigo-300 pl-4 italic my-2">{children}</blockquote>;
        },
        h1({ children }) {
          return <h1 className="text-xl font-bold mb-2">{children}</h1>;
        },
        h2({ children }) {
          return <h2 className="text-lg font-bold mb-2">{children}</h2>;
        },
        h3({ children }) {
          return <h3 className="text-md font-bold mb-2">{children}</h3>;
        },
      }}
    >
      {content}
    </ReactMarkdown>
  ));

  return (
    <div className={`w-full  animate-in fade-in duration-500 relative
     `}>
      <ToastContainer />

      {isLoadingAI && <LoadingAnimation />}

      <div className={`flex w-full transition-all duration-300 ${
            !isFullScreen && isChatOpen ? 'lg:mr-[420px] -ml-20 ' : 'mx-auto'
          } `}style={{ maxWidth: isChatOpen && !isFullScreen ? 'calc(100% - 200px)' : '100%' }}>
        {/* Main Content Area - FIXED WIDTH ISSUE */}
        <div 
          className={`flex-1 transition-all duration-300 ${
            !isFullScreen && isChatOpen ? '-ml-[60px] ' : 'mx-auto'
          } ${isFullScreen ? 'hidden' : ''}`} 
         >
          <div className="w-full px-4 md:px-6 lg:px-8">
          {!showResults ? (
            // ================= QUIZ UI =================
            <div className="space-y-6 pb-20 w-full">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-black text-[#111827]">
                  Knowledge Check
                </h1>
                {!isAllSubjective ? <p className="text-gray-500 font-medium">
                  Select the best answer for each question.
                </p> : <p className="text-gray-500 font-medium">
                  Answer the following questions correctly.
                </p>}
              </div>

              {questionArr.map((q, i) => (
                <div
                  key={i}
                  className={`bg-white border transition-all duration-200 p-6 rounded-3xl shadow-sm hover:shadow-md w-full ${selectedQuestionIndex === i
                      ? 'border-[#4F46E5] ring-4 ring-indigo-500/10'
                      : 'border-[#E0E7FF]'
                    }`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <span className="bg-[#EEF2FF] text-[#4F46E5] font-black px-3 py-1 rounded-lg text-sm">
                      Q{i + 1}
                    </span>
                    <h2 className="font-bold text-[#1F2937] text-lg leading-snug flex-1">
                      {q.question}
                    </h2>
                    <button
                      onClick={() => {
                        toggleQuestionSelection(i);
                        setIsChatOpen(true);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedQuestionIndex === i
                          ? 'bg-[#4F46E5] text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      {selectedQuestionIndex === i ? '✓ Selected' : 'Ask AI'}
                    </button>
                  </div>

                  {q.type === "mcq" ? (
                    <div className="grid grid-cols-1 gap-3 w-full">
                      {Object.entries(q.options).map(([key, value]) => (
                        <label
                          key={key}
                          className={`group flex items-center p-4 rounded-2xl border-2 cursor-pointer transition-all w-full
                          ${selectedAnswers[i] === key
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
                            className={`ml-4 font-semibold ${selectedAnswers[i] === key
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
            <div className={`space-y-8 pb-20 w-full ${
            !isFullScreen && isChatOpen ? '-ml-[10px] ' : 'mx-auto'
          } ${isFullScreen ? 'hidden' : ''}`}>
              {/* Only show pie chart and stats for non-subjective questions */}
              {!isAllSubjective && (
                <div className="bg-white rounded-[2.5rem] border p-4 md:p-8 shadow-xl w-full">
                  <h3 className="text-2xl font-black text-center mb-6">
                    Your Performance
                  </h3>

                  <div className={`flex ${!isFullScreen && isChatOpen ? 'flex-col' : 'flex-col md:flex-row'} items-center gap-8 w-full`}>
                    <div className={`${!isFullScreen && isChatOpen ? 'w-full' : 'flex-1 w-full max-w-[280px]'}`}>
                      <PieChart chart={chart} isChatOpen={isChatOpen} isFullScreen={isFullScreen} />
                    </div>

                    <div className="flex-1 space-y-4 w-full">
                      {/* Total Score */}
                      <div className="bg-[#F9FAFB] p-4 rounded-2xl border border-[#E0E7FF] w-full">
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
                      <div className={`grid ${!isFullScreen && isChatOpen ? 'grid-cols-3' : 'grid-cols-1 sm:grid-cols-3'} gap-4 w-full`}>
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
                <div className="bg-white p-4 md:p-8 rounded-3xl shadow-xl text-center flex flex-col justify-center items-center w-full">
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
              <div className="bg-white rounded-3xl border p-4 md:p-6 shadow-sm w-full">
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
                          ? `p-4 md:p-6 rounded-3xl border-2 my-3 w-full ${skipped
                            ? "bg-gray-50 border-gray-200"
                            : isCorrect
                              ? "bg-white border-green-200"
                              : "bg-white border-red-200"
                          }`
                          : "bg-gray-50 p-4 md:p-5 rounded-2xl border my-4 w-full"
                      }
                    >
                      <div className="flex items-start gap-4 mb-2">
                        <p className="font-bold text-[#1F2937] flex-1">
                          Q{i + 1}: {q.question}
                        </p>
                        <button
                          onClick={() => {
                            toggleQuestionSelection(i);
                            setIsChatOpen(true);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedQuestionIndex === i
                              ? 'bg-[#4F46E5] text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                          {selectedQuestionIndex === i ? '✓ Selected' : 'Ask AI'}
                        </button>
                      </div>

                      {isMCQ ? (
                        <div className="text-sm space-y-1">
                          <p
                            className={`${skipped
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
              <div className="bg-[#111827] p-4 md:p-8 rounded-[2rem] text-white space-y-6 shadow-2xl w-full">
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
        </div>

        {/* Chatbot Sidebar Toggle Button */}
        {!isFullScreen && (
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`fixed bottom-6 right-6 z-40 bg-[#4F46E5] hover:bg-[#6366F1] text-white p-4 rounded-full shadow-2xl transition-all duration-300 ${isChatOpen ? 'scale-0' : 'scale-100'
              }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </button>
        )}

        {/* Chatbot Sidebar / Full Screen */}
        <div
          className={`fixed top-0 right-0 h-full bg-white shadow-2xl transform transition-all duration-300 z-50 flex flex-col ${isChatOpen ? 'translate-x-0' : 'translate-x-full'
            } ${isFullScreen
              ? 'w-full'
              : 'w-full lg:w-[420px]'
            }`}
        >
          {/* Chat Header */}
          <div className="bg-[#1F2937] text-white p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-[#4F46E5] w-10 h-10 rounded-xl flex items-center justify-center">
                <span className="text-xl">🤖</span>
              </div>
              <div>
                <h3 className="font-bold text-lg">AI Assistant</h3>
                <p className="text-xs text-gray-400">
                  {selectedQuestionIndex !== null
                    ? `Selected: Q${selectedQuestionIndex + 1}`
                    : 'Ask about any topic'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Full Screen Toggle Button */}
              <button
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="text-gray-400 hover:text-white transition-colors p-2"
                title={isFullScreen ? "Exit Full Screen" : "Full Screen"}
              >
                {isFullScreen ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9L4 4m0 0l5 5M4 4l5 5M15 9l5-5m0 0l-5 5m5-5l-5 5M9 15l-5 5m0 0l5-5m-5 5l5-5M15 15l5 5m0 0l-5-5m5 5l-5-5" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                )}
              </button>
              {/* Close Button */}
              <button
                onClick={() => {
                  setIsChatOpen(false);
                  setIsFullScreen(false);
                }}
                className="text-gray-400 hover:text-white transition-colors p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F9FAFB] relative"
          >
            {chatMessages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <p className="font-bold mb-2">👋 Hello! I'm your AI assistant</p>
                  <p className="text-sm">
                    {selectedQuestionIndex !== null
                      ? `You've selected Question ${selectedQuestionIndex + 1}. Feel free to ask anything about it!`
                      : 'You can ask me about any question or topic. Select a specific question for more focused help.'}
                  </p>
                  <div className="mt-4 space-y-2">
                    <p className="text-xs text-gray-400">Try asking:</p>
                    <button
                      onClick={() => setChatInput("Can you explain this concept?")}
                      className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100"
                    >
                      "Can you explain this concept?"
                    </button>
                    <button
                      onClick={() => setChatInput("Give me an example")}
                      className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-100 ml-2"
                    >
                      "Give me an example"
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user'
                        ? 'bg-[#4F46E5] text-white'
                        : 'bg-white text-gray-800 shadow-sm'
                      }`}
                  >
                    {msg.role === 'assistant' ? (
                      <MarkdownMessage content={msg.content} />
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))
            )}
            {isChatLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl shadow-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatMessagesEndRef} />

            {/* Scroll to Bottom Button */}
            {showScrollButton && (
              <button
                onClick={scrollToBottom}
                className="sticky bottom-4 left-1/2 -translate-x-1/2 bg-[#4F46E5] text-white p-3 rounded-full shadow-lg hover:bg-[#6366F1] transition-all z-10"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>
            )}
          </div>

          {/* Chat Input */}
          <div className="p-4 bg-white border-t">
            {selectedQuestionIndex !== null && (
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-lg">
                  Selected: Q{selectedQuestionIndex + 1}
                </span>
                <button
                  onClick={() => setSelectedQuestionIndex(null)}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear
                </button>
              </div>
            )}
            <div className="flex gap-2">
              <textarea
                ref={chatInputRef}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask anything..."
                className="flex-1 border rounded-xl p-3 resize-none text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows="1"
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
              <button
                onClick={handleSendMessage}
                disabled={!chatInput.trim() || isChatLoading}
                className="bg-[#4F46E5] hover:bg-[#6366F1] disabled:bg-gray-300 text-white p-3 rounded-xl transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionRenderingPage;