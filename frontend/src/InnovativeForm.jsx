import React, { useState } from "react";
import axios from 'axios'
import Questions from './QuestionPage'
import photo from './photo.jpg'
import loading from './loading.jpg'

import { GoogleGenAI } from '@google/genai';
const InnovativeForm = () => {

  //key
  const apikey = import.meta.env.VITE_API_KEY;
  // const apikey = '';

const ai = apikey ? new GoogleGenAI({ apiKey: apikey }) : null;
  //data variables
  const [questionArr, setQuestionArr] = useState([])
  const [paragraph, setParagraph] = useState('')
  const [numOfMCQ, setNumOfMCQ] = useState(5)
  
  // alert variable 

  const[emptyParaAlert,setEmptyParaAlert] = useState(false)
  const[mcqAlert,setMcqAlert] = useState(false)
  // auxillary varialbes
  const [submitted, setSubmitted] = useState(false);
const changeSubmitted = () => {
 setSubmitted(false)
  setQuestionArr([])
  setParagraph('')
  setNumOfMCQ(5)
}
 const validate = () =>{
  if(paragraph && numOfMCQ>0){
    handleSubmit()
  }else{
     if(!paragraph){
  setEmptyParaAlert(true)
     }else{
      setEmptyParaAlert(false)
     }
     if(numOfMCQ==0){
      setMcqAlert(true)
     }else{
      setMcqAlert(false)
     }
  }
 }

 // Add this helper function before the InnovativeForm component
const fixIncompleteJSON = (incompleteJSON) => {
  try {
    // Count open brackets and close them
    let openBraces = 0;
    let openBrackets = 0;
    let inString = false;
    let escapeNext = false;
    
    for (let i = 0; i < incompleteJSON.length; i++) {
      const char = incompleteJSON[i];
      
      if (escapeNext) {
        escapeNext = false;
        continue;
      }
      
      if (char === '\\') {
        escapeNext = true;
        continue;
      }
      
      if (char === '"' && !escapeNext) {
        inString = !inString;
        continue;
      }
      
      if (!inString) {
        if (char === '{') openBraces++;
        if (char === '}') openBraces--;
        if (char === '[') openBrackets++;
        if (char === ']') openBrackets--;
      }
    }
    
    // Close remaining brackets
    let fixedJSON = incompleteJSON;
    while (openBraces > 0) {
      fixedJSON += '}';
      openBraces--;
    }
    
    while (openBrackets > 0) {
      fixedJSON += ']';
      openBrackets--;
    }
    
    // Try to parse the fixed JSON
    JSON.parse(fixedJSON);
    return fixedJSON;
  } catch {
    return null;
  }
};

 const handleSubmit = async () => {
  if (!ai) {
    alert("API Key not found. Please check your API configuration.");
    return;
  }
  
  setSubmitted(true);
  
  const content = `${paragraph} , Get me ${numOfMCQ} MCQ questions from this given content in below given format and must give in below given json format  , our highest priority is JSON format response , please do not send any other except this json formate , please send medium hard questions : 
  [ { question: "What is the capital of France?", options: { A: "Berlin", B: "Madrid", C: "Paris", D: "Rome", }, answer: "C", }, { question: "Which programming language is used for web development?", options: { A: "Python", B: "JavaScript", C: "C++", D: "Java", }, answer: "B", }]`;

  setParagraph('');

  try {
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: "user", parts: [{ text: content }] }],
      config: {
        temperature: 0.7,
        maxOutputTokens: 5000,
      }
    });

    console.log('Full API Response:', result);

    // Extract text from the proper path
    const resText = result?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    console.log('Extracted text:', resText);
    
   if (resText) {
  // Check if response was truncated
  const finishReason = result?.candidates?.[0]?.finishReason;
  
  if (finishReason === 'MAX_TOKENS') {
    // Response was truncated - need to handle incomplete JSON
    console.warn('Response truncated due to token limit');
    
    // Try to extract and fix incomplete JSON
    try {
      // Remove markdown code blocks if present
      let cleanedText = resText.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
      
      // Find the last complete JSON object
      const jsonMatch = cleanedText.match(/\[[\s\S]*?\}\]/);
      
      if (jsonMatch) {
        const potentialJSON = jsonMatch[0];
        
        // Try to parse it
        try {
          const jsn = JSON.parse(potentialJSON);
          setQuestionArr(jsn);
        } catch {
          // If parsing fails, try to complete the JSON
          const fixedJSON = fixIncompleteJSON(potentialJSON);
          if (fixedJSON) {
            const jsn = JSON.parse(fixedJSON);
            setQuestionArr(jsn);
          } else {
            throw new Error('Could not fix incomplete JSON');
          }
        }
      } else {
        // No JSON found at all
        setQuestionArr([{
          question: "Response truncated. Please try with fewer questions or shorter content.",
          options: { A: "Reduce MCQ count", B: "Shorter paragraph", C: "Try again", D: "Contact support" },
          answer: "A"
        }]);
      }
    } catch (error) {
      setQuestionArr([{
        question: "Incomplete response received. Try reducing the number of questions.",
        options: { A: "Try with 3 MCQs", B: "Use shorter text", C: "Try again", D: "Contact support" },
        answer: "A"
      }]);
    }
  } else {
    // Normal response processing
    try {
      // Remove markdown code blocks if present
      let cleanedText = resText.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
      
      // Try to extract JSON from the response
      const jsonMatch = cleanedText.match(/\[[\s\S]*\]/s);
      
      if (jsonMatch) {
        const stringJSON = jsonMatch[0];
        const jsn = JSON.parse(stringJSON);
        setQuestionArr(jsn);
      } else {
        // If no JSON found, try to parse the whole response as JSON
        try {
          const jsn = JSON.parse(cleanedText);
          setQuestionArr(jsn);
        } catch {
          setQuestionArr([{
            question: "No valid JSON found in response",
            options: { A: "Try again", B: "Check format", C: "Review content", D: "Contact support" },
            answer: "A"
          }]);
        }
      }
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      setQuestionArr([{
        question: "JSON parsing failed: " + parseError.message,
        options: { A: "Try again", B: "Check format", C: "Review API", D: "Contact support" },
        answer: "B"
      }]);
    }
  }
}
    
  } catch (err) {
    console.error("Gemini API Error:", err);
    let errorMessage = "Failed to get response.";
    
    if (err.message.includes("429")) {
      errorMessage = "API quota exceeded. Please try again later.";
    } else if (err.message.includes("401") || err.message.includes("403")) {
      errorMessage = "Invalid API key. Please check your API key.";
    } else {
      errorMessage = err.message || "An unknown error occurred.";
    }
    
    setQuestionArr([{
      question: "Error: " + errorMessage,
      options: { A: "Try again", B: "Check connection", C: "Verify API key", D: "Contact support" },
      answer: "C"
    }]);
  }
};

  return (
    <div className={`flex items-center justify-center p-5 bg-gradient-to-r from-teal-500 via-indigo-600 to-purple-700 h-screen overflow-y-auto`}>
      <div className={`bg-white rounded-xl shadow-xl w-full p-5 max-w-4xl space-y-2 transform transition-transform duration-500 hover:scale-105 ${submitted ? 'hidden' : ''} `}>
        <img src={loading} width='100px' height='80px' className='rounded-[50px] mx-auto' />
        <h1 className="text-4xl font-semibold text-center text-gray-800">
          Input Your Paragraph
        </h1>

        {/* Subheading with gradient effect */}
        <p className="text-xl text-center text-gray-600">
          That You Can Get Your MCQ Questions :
        </p>

        {/* Input Field */}
        <textarea
          onChange={(e) => { setParagraph(e.target.value) }}
          value={paragraph}
          className="w-full h-[250px] p-2 rounded-lg border-2 border-gray-300 bg-gray-50 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500  resize-none"
          placeholder="Your insights here..."
        ></textarea>

        <label className={`text-red-500 ${emptyParaAlert?'':'hidden'}`}>* Input is required...</label>

        {/* Submit Button */}
        <div className='flex justify-around items-center'>
          <button
            onClick={validate}
            className={`py-3 px-6 rounded-lg font-medium text-lg text-white shadow-md
             bg-gradient-to-r from-indigo-600 to-purple-700 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-300"
             `}
          >
            {submitted ? "Submitted!" : "Submit"}
          </button>
          <div className="flex justify-center items-center space-x-[10px]">
            <label className={`${mcqAlert?'text-red-500':''}`} >No. of MCQ's : </label>
            <input
              type='number'
              onChange={(e) => { setNumOfMCQ(e.target.value) }}
              value={numOfMCQ}
              className={`border-2 border-gray-300 bg-gray rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-[60px] h-10
             `}
            />
          </div>
        </div>



      </div>
      {(submitted && questionArr.length == 0) &&

        <div className='flex flex-col items-center'>
          <div className="relative inline-block w-[216px] h-[216px]">
            <div className="absolute inset-0 rounded-full border-4 border-gray-300 animate-spin">
              <div className="w-full h-full border-4 border-t-blue-500 rounded-full"></div>
            </div>
            <img
              src={loading}
              width="225px"
              className="rounded-full h-full object-cover p-4"
              alt="Loading..."
            />

          </div><br/>
         
            <label className="text-[30px]" >Loading...</label>
        </div>
      }


      {(submitted && questionArr.length > 0) &&
        <Questions questionArr={questionArr} changeSubmitted={changeSubmitted}/>
      }

    </div>
  )
}


export default InnovativeForm;
