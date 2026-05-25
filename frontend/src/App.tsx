//import { useState } from "react";
//import { api } from "./utils/api";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import AppLayout from "@/layouts/AppLayout.tsx";
import UnderConstruction from "./pages/UnderConstruction.tsx";
import Menu from "./pages/Menu.tsx";

function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<UnderConstruction page="Dashboard" />} />
          <Route path="/sales" element={<UnderConstruction page="Sales" />} />
          <Route path="/order" element={<UnderConstruction page="Order" />} />
          <Route path="/menu" element={<Menu />} />
          <Route
            path="/receipts"
            element={<UnderConstruction page="Receipts" />}
          />
          <Route
            path="/account"
            element={<UnderConstruction page="Account" />}
          />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;
