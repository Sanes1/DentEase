import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import Login from "./pages/Login.jsx"; // ✅ Import Login page

function App() {
  return (
    <Router>
      <Routes>
        {/* Default route → Login */}
        <Route path="/" element={<Login />} /> 

        {/* Dashboard route */}
        <Route path="/dashboard" element={<Dashboard />} /> 
      </Routes>
    </Router>
  );
}

export default App;
