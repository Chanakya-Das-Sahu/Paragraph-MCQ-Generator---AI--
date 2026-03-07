
# Paragraph MCQ Generator - AI

## Project Description
An intelligent AI-powered application that automatically generates multiple-choice questions (MCQs) from paragraphs or topic given. This tool helps educators and learners create assessments efficiently by converting text content into structured quiz questions.

## Objective of the Project
To streamline the creation of MCQ-based assessments by leveraging AI to automatically generate relevant questions and answer options from given paragraph text, reducing manual effort and improving assessment quality.

## Technologies Used
- **Frontend:** React, Vite, Tailwind CSS
- **Runtime:** Node.js
- **Build Tools:** ESLint, PostCSS
- **Environment:** JavaScript
- **API:** Gemini

## Features
- Paragraph input for MCQ generation
- AI-powered question and answer generation
- Multiple-choice question rendering
- Interactive question display interface
- Mail Based Report Facility 

## How to Run the Project
1. Install dependencies: `npm install` in frontend and backend folders
2. Configure environment variables in `.env`

## .env Variables 

# Frontend : 
- VITE_API_KEY ( GEMINI KEY)
- VITE_WORKING_MODE == 'dev' 

# Backend :
- PASS ( Application Password of Gmail )

3. Start the development server: 
      frontend :`npm run dev` 
      backend : `nodemon`
4. Open the application in your browser at the provided localhost URL


## Project Structure
```
frontend/
├── src/
│   ├── App.jsx
│   ├── home.jsx
│   ├── QuestionsRenderingPage.jsx
│   ├── RenderingComponent.jsx
│   └── main.jsx
├── components/
│   └── DevCredit.jsx
├── utils/
│   └── getServerUrl.js
├── package.json
└── tailwind.config.js
```

## Author / Developer Information
Developed by Chanakya Das Sahu 

https://chanakya-das-sahu.netlify.app
