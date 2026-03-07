import React, { useState } from "react";
import QuestionRenderingPage from './QuestionsRenderingPage';
import loading from './loading.jpg';
import { GoogleGenAI } from '@google/genai';

const RenderingComponent = () => {
  // --- FUNCTIONALITY (PRESERVED EXACTLY) ---
  const apikey = import.meta.env.VITE_API_KEY;
  const ai = apikey ? new GoogleGenAI({ apiKey: apikey }) : null;

  const [questionArr, setQuestionArr] = useState([]);
  const [paragraph, setParagraph] = useState('');
  const [numOfMCQ, setNumOfMCQ] = useState(5);
  const [emptyParaAlert, setEmptyParaAlert] = useState(false);
  const [mcqAlert, setMcqAlert] = useState(false);
  const [topicSubmitted, setTopicSubmitted] = useState(false);

  const changeSubmitted = () => {
    setTopicSubmitted(false);
    setQuestionArr([]);
    setParagraph('');
    setNumOfMCQ(5);
  };

  const validate = () => {
    if (paragraph && numOfMCQ > 0) {
      handleSubmit();
    } else {
      if (!paragraph) { setEmptyParaAlert(true); } 
      else { setEmptyParaAlert(false); }
      if (numOfMCQ == 0) { setMcqAlert(true); } 
      else { setMcqAlert(false); }
    }
  };

  const fixIncompleteJSON = (incompleteJSON) => {
    try {
      let openBraces = 0; let openBrackets = 0;
      let inString = false; let escapeNext = false;
      for (let i = 0; i < incompleteJSON.length; i++) {
        const char = incompleteJSON[i];
        if (escapeNext) { escapeNext = false; continue; }
        if (char === '\\') { escapeNext = true; continue; }
        if (char === '"' && !escapeNext) { inString = !inString; continue; }
        if (!inString) {
          if (char === '{') openBraces++; if (char === '}') openBraces--;
          if (char === '[') openBrackets++; if (char === ']') openBrackets--;
        }
      }
      let fixedJSON = incompleteJSON;
      while (openBraces > 0) { fixedJSON += '}'; openBraces--; }
      while (openBrackets > 0) { fixedJSON += ']'; openBrackets--; }
      JSON.parse(fixedJSON);
      return fixedJSON;
    } catch { return null; }
  };

  const handleSubmit = async () => {
    if (!ai) { alert("API Key not found."); return; }
    setTopicSubmitted(true);
    const content = `${paragraph} , Get me ${numOfMCQ} MCQ questions from this given content in below given format and must give in below given json format  , our highest priority is JSON format response , please do not send any other except this json formate , please send medium hard questions : 
  [ { question: "What is the capital of France?", options: { A: "Berlin", B: "Madrid", C: "Paris", D: "Rome", }, answer: "C", }, { question: "Which programming language is used for web development?", options: { A: "Python", B: "JavaScript", C: "C++", D: "Java", }, answer: "B", }]`;

    setParagraph(''); ``
    try {
      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: "user", parts: [{ text: content }] }],
        config: { temperature: 0.7, maxOutputTokens: 5000 }
      });
      const resText = result?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (resText) {
        const finishReason = result?.candidates?.[0]?.finishReason;
        let cleanedText = resText.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
        if (finishReason === 'MAX_TOKENS') {
          const jsonMatch = cleanedText.match(/\[[\s\S]*?\}\]/);
          if (jsonMatch) {
            try { setQuestionArr(JSON.parse(jsonMatch[0])); } 
            catch { const fixed = fixIncompleteJSON(jsonMatch[0]); if (fixed) setQuestionArr(JSON.parse(fixed)); }
          }
        } else {
          const jsonMatch = cleanedText.match(/\[[\s\S]*\]/s);
          setQuestionArr(JSON.parse(jsonMatch ? jsonMatch[0] : cleanedText));
        }
      }
    } catch (err) { setQuestionArr([{ question: "Error: " + err.message, options: { A: "Retry" }, answer: "A" }]); }
  };

  // --- NEW INNOVATIVE DESIGN ---

  const renderInputPannel = () =>(
      <div className="w-full max-w-6xl h-screen md:h-[85vh] bg-white/70 backdrop-blur-xl rounded-none md:rounded-[2.5rem] shadow-[0_32px_64px_-15px_rgba(0,0,0,0.1)] flex flex-col md:flex-row overflow-hidden ">
          
          {/* Left Panel: Brand & Instructions */}
          <div className="md:w-72 bg-[#1F2937] p-8 text-white flex flex-col justify-between border-r border-white/10">
            <div>
              <div className="bg-[#4F46E5] w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg mb-8 shadow-indigo-500/40">
                <img src={loading} className="w-8 h-8 rounded-lg" alt="logo" />
              </div>
              <h2 className="text-xl font-black tracking-tight mb-4">Quiz Engine v2</h2>
              <ul className="space-y-4 text-xs font-medium text-gray-400">
                <li className="flex items-center gap-3"><span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center italic">1</span> Paste your raw text</li>
                <li className="flex items-center gap-3"><span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center italic">2</span> Choose MCQ count</li>
                <li className="flex items-center gap-3"><span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center italic">3</span> AI generates quiz</li>
              </ul>
            </div>
            <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Secure AI Processing</div>
          </div>

          {/* Right Panel: Workspace */}
          <div className="flex-1 flex flex-col relative bg-[#F9FAFB]/50">
            <div className="p-6 md:p-10 flex-1 overflow-y-auto pb-32">
              <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-black text-[#111827] mb-2">Workspace</h1>
                <p className="text-gray-500 mb-8 font-medium">Input your paragraph to extract knowledge.</p>
                
                <textarea
                  onChange={(e) => setParagraph(e.target.value)}
                  value={paragraph}
                  className={`w-full h-[50vh] md:h-96 p-8 rounded-3xl border-2 transition-all duration-300 text-lg shadow-inner bg-white/80 backdrop-blur-sm
                    ${emptyParaAlert ? 'border-red-400 ring-4 ring-red-500/10' : 'border-[#E0E7FF] focus:border-[#4F46E5] focus:ring-4 focus:ring-indigo-500/5'}`}
                  placeholder="The magic starts here..."
                />
                {emptyParaAlert && <p className="text-red-500 text-xs font-bold mt-4 uppercase tracking-widest animate-pulse">Required Field</p>}
              </div>
            </div>

            {/* Floating Footer Controls */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl bg-[#111827] rounded-3xl p-4 flex items-center justify-between shadow-2xl border border-white/10">
              <div className="flex items-center gap-4 px-4">
                <span className="text-gray-400 text-xs font-black uppercase tracking-tighter">MCQs</span>
                <input
                  type="number"
                  value={numOfMCQ}
                  onChange={(e) => setNumOfMCQ(e.target.value)}
                  className={`w-12 bg-gray-800 border-none rounded-xl text-center font-black text-indigo-400 text-lg focus:ring-2 focus:ring-indigo-500 ${mcqAlert ? 'text-red-500' : ''}`}
                />
              </div>

              <button
                onClick={validate}
                className="bg-[#4F46E5] hover:bg-[#6366F1] text-white px-8 py-3 rounded-2xl font-black text-sm tracking-wide transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
              >
                Generate Questions
              </button>
            </div>
          </div>
        </div>
  )

  const renderLoadingInterface = ()=>(
      <div className="flex flex-col items-center justify-center animate-in zoom-in duration-300 ">
          <div className="relative">
            <div className="w-32 h-32 border-[10px] border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <img src={loading} className="absolute inset-0 m-auto w-20 h-20 rounded-2xl rotate-[-10deg]" alt="loading" />
          </div>
          <h2 className="text-2xl font-black text-[#1F2937] mt-10 tracking-tight italic">AI IS THINKING...</h2>
        </div>
  )

  return (
    <div className="min-h-screen bg-[#EEF2FF] flex items-center justify-center p-0 md:p-6 font-sans">
      
      {!topicSubmitted && 
        renderInputPannel()
      }

      {/* LOADING STATE */}
      {topicSubmitted && questionArr.length === 0 && (
        renderLoadingInterface()
      )}

      {/* RESULTS */}
      {topicSubmitted && questionArr.length > 0 && (
        <div className="w-full max-w-5xl px-4 animate-in slide-in-from-bottom-12 duration-500 ">
           <QuestionRenderingPage questionArr={questionArr} changeSubmitted={changeSubmitted} />
        </div>
      )}
    </div>
  );
};

export default RenderingComponent;