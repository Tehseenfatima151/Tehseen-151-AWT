import React, { useState, useEffect } from "react";
import {
  getBooks,
  getMembers,
  getBorrowRecords,
  borrowBook,
  returnBorrowRecord,
} from "../services/api";

const BorrowedBooksPage = () => {
  const [members, setMembers] = useState([]);
  const [books, setBooks] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [borrowMemberId, setBorrowMemberId] = useState("");
  const [borrowBookId, setBorrowBookId] = useState("");

  const loadData = async () => {
    try {
      const [membersRes, booksRes, recordsRes] = await Promise.all([
        getMembers(),
        getBooks(),
        getBorrowRecords(),
      ]);
      setMembers(membersRes.data || []);
      setBooks(booksRes.data || []);
      setRecords(recordsRes.data || []);
    } catch (err) {
      console.error("Failed to load data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleBorrow = async (e) => {
    e.preventDefault();
    if (!borrowMemberId || !borrowBookId) return;
    try {
      await borrowBook(borrowMemberId, borrowBookId);
      setBorrowMemberId("");
      setBorrowBookId("");
      loadData();
    } catch (err) {
      alert(err.message || "Failed to borrow book.");
    }
  };

  const handleReturn = async (recordId) => {
    try {
      await returnBorrowRecord(recordId);
      loadData();
    } catch (err) {
      alert(err.message || "Failed to return book.");
    }
  };

  const availableBooks = books.filter((b) => (Number(b.availableCopies) || 0) > 0);

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="loading-wrap">
          <div className="spinner-border spinner-app" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-0">
      <header className="page-header mb-4">
        <h1>Borrowed Books</h1>
        <p>Issue and return books • Due date is 14 days from borrow</p>
      </header>

      <div className="card card-app border-0 p-4 p-lg-5 mb-4">
        <h5 className="fw-bold mb-4">Borrow a Book</h5>
        <form onSubmit={handleBorrow} className="row g-3">
          <div className="col-12 col-md-4">
            <label className="form-label form-label-app">Member</label>
            <select
              className="form-select form-select-app"
              value={borrowMemberId}
              onChange={(e) => setBorrowMemberId(e.target.value)}
              required
            >
              <option value="">Select member</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col-12 col-md-4">
            <label className="form-label form-label-app">Book (with available copies)</label>
            <select
              className="form-select form-select-app"
              value={borrowBookId}
              onChange={(e) => setBorrowBookId(e.target.value)}
              required
            >
              <option value="">Select book</option>
              {availableBooks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title} — {b.author} ({b.availableCopies} left)
                </option>
              ))}
            </select>
          </div>
          <div className="col-12 col-md-4 d-flex align-items-end">
            <button type="submit" className="btn btn-app-primary">
              Borrow Book
            </button>
          </div>
        </form>
      </div>

      <div className="card card-app border-0 overflow-hidden">
        <div className="card-header bg-transparent border-bottom px-4 py-3">
          <h5 className="fw-bold mb-0">All Borrow Records</h5>
          <p className="text-secondary small mb-0 mt-1">Member • Book • Borrow / Due / Return • Status</p>
        </div>
        <div className="table-responsive">
          <table className="table table-app align-middle mb-0">
            <thead>
              <tr>
                <th>Member Name</th>
                <th>Book Title</th>
                <th>Borrow Date</th>
                <th>Due Date</th>
                <th>Return Date</th>
                <th>Status</th>
                <th className="text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-secondary">
                    No borrow records yet.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr key={r.id}>
                    <td className="fw-semibold">{r.memberName}</td>
                    <td>{r.bookTitle}</td>
                    <td>{r.borrowDate}</td>
                    <td>{r.dueDate}</td>
                    <td>{r.returnDate || "—"}</td>
                    <td>
                      <span
                        className={`badge rounded-pill ${
                          r.status === "Returned"
                            ? "bg-success"
                            : r.status === "Overdue"
                            ? "bg-danger"
                            : "bg-warning text-dark"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="text-end">
                      {!r.returnDate ? (
                        <button
                          type="button"
                          className="btn btn-sm btn-return"
                          onClick={() => handleReturn(r.id)}
                        >
                          Return
                        </button>
                      ) : (
                        <span className="text-muted small">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BorrowedBooksPage;
