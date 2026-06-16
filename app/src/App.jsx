import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import heroImg from "./assets/hero.png";
import "./App.css";
import Login from "./views/Login";
import Dashboard from "./views/Dashboard";
import DetalleProyecto from "./views/DetalleProyecto";
import GaleriaCliente from "./views/GaleriaCliente";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/proyecto/:id" element={<DetalleProyecto />} />
        <Route path="/galeria/:id" element={<GaleriaCliente />} />
      </Routes>
    </Router>
  );
}

export default App;
