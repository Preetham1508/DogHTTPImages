import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SearchPage from "./SearchPage";
import ShowList from "./ShowList.js"
import Login from "./login.js";
import Signup from "./signup.js";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/show" element={<ShowList />} />
      </Routes>
    </Router>
  );
}

export default App;