import "./App.css";
import HomePage from "./HomePage/HomePage";
import { Routes, Route} from "react-router-dom";
import Dashboard from "./Dashboard/Dashboard";
import PhoneNumber from "./PhoneNumber/PhoneNumber";
import AuthCode from "./AuthCode/AuthCode";
import Password from "./Password/Password";
function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/phonenumber" element={<PhoneNumber />} />
      <Route path="/authcode" element={<AuthCode />} />
      <Route path="/password" element={<Password />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App;
