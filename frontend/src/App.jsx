import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./home.jsx";
import RenderingComponent from "./RenderingComponent.jsx";
import DevCredits from "../components/DevCredit.jsx";
// import QuestionPage from "./QuestionPage";
const App = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/innovativeForm" element={<RenderingComponent />} />
          {/* <Route paths='/kl' element={<DevCredits /> } /> */}
          {/* <Route path="/questions" element={<QuestionPage/>}/> */}
        </Routes>
        {/* <DevCredits /> */}
      </BrowserRouter>
    </>
  );
};

export default App;
