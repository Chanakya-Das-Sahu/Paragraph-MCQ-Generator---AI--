import React, { useState } from "react";
import axios from 'axios'

import Questions from './Questions'
import photo from './photo.jpg'
import loading from './loading.jpg'
const InnovativeForm = () => {

  //key
  const apikey = import.meta.env.VITE_API_KEY;

  //data variables
  const [questionArr, setQuestionArr] = useState([])
  const [paragraph, setParagraph] = useState('')
  const [numOfMCQ, setNumOfMCQ] = useState(0)
  
  // alert variable 

  const[emptyParaAlert,setEmptyParaAlert] = useState(false)
  const[mcqAlert,setMcqAlert] = useState(false)
  // auxillary varialbes
  const [submitted, setSubmitted] = useState(false);

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
  const handleSubmit = async () => {
    setSubmitted(true)
    const content = `${paragraph} , Get me ${numOfMCQ} MCQ questions from this given content in below given format and must give in below given json format  , our highest priority is JSON format response , please do not send any other except this json formate , please send medium hard questions : 
    [ { question: "What is the capital of France?", options: { A: "Berlin", B: "Madrid", C: "Paris", D: "Rome", }, answer: "C", }, { question: "Which programming language is used for web development?", options: { A: "Python", B: "JavaScript", C: "C++", D: "Java", }, answer: "B", }]`

    const payload = { "contents": [{ "parts": [{ "text": content }] }] }
    setParagraph('')
    const res = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apikey}`, payload)
    const resText = res?.data?.candidates[0]?.content?.parts[0]?.text
    console.log('es', resText)
    const stringJSON = resText.match(/\[.*\]/s)?.[0]
    const jsn = JSON.parse(stringJSON)
    setQuestionArr(jsn)
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
        <Questions questionArr={questionArr} />
      }

    </div>
  )
}


export default InnovativeForm;
