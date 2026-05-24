//import { useState } from "react";
//import { api } from "./utils/api";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import AppLayout from "@/layouts/AppLayout.tsx";
import Menu from "./pages/Menu.tsx";

function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" />
          <Route path="/sales" />
          <Route path="/order" />
          <Route path="/menu" element={<Menu />} />
          <Route path="/receipts" />
          <Route path="/account" />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;
