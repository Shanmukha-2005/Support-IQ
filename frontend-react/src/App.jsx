import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Customer from "./pages/Customer";
import Agent from "./pages/Agent";
import Admin from "./pages/Admin";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/customer" element={<Customer />} />
      <Route path="/agent" element={<Agent />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  );
}

export default App;
