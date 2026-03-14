import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import BooksPage from "./pages/BooksPage";
import MembersPage from "./pages/MembersPage";
import BorrowedBooksPage from "./pages/BorrowedBooksPage";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app-wrapper d-flex flex-column min-vh-100">
        <Navbar />
        <div className="app-body d-flex flex-grow-1">
          <Sidebar />
          <main className="main-content flex-grow-1 p-4 p-lg-5">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/books" element={<BooksPage />} />
              <Route path="/members" element={<MembersPage />} />
              <Route path="/borrowed-books" element={<BorrowedBooksPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
