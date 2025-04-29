import React from "react";
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import HomePage from "./home.jsx";
import InnovativeForm from "./InnovativeForm.jsx";
// import QuestionPage from "./QuestionPage";
const App = () => {
    return(
        <>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage/>}/>
                <Route path="/innovativeForm" element={<InnovativeForm/>}/>
                {/* <Route path="/questions" element={<QuestionPage/>}/> */}
            </Routes>
        </BrowserRouter>
        </>
    )
}

export default App;