/**
 * API Service Layer - REST client for Library Management System
 * Book model: id, title, author, isbn, category, totalCopies, availableCopies
 * BorrowRecord: id, memberId, bookId, borrowDate, dueDate, returnDate, status (Borrowed | Returned | Overdue)
 */

import axios from "axios";
import { dummyBooks, dummyMembers, dummyBorrowRecords } from "../data/dummyData";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

let books = JSON.parse(JSON.stringify(dummyBooks));
let members = JSON.parse(JSON.stringify(dummyMembers));
let borrowRecords = JSON.parse(JSON.stringify(dummyBorrowRecords));

const useDummyData = !process.env.REACT_APP_API_URL;

function getDisplayStatus(record) {
  if (record.returnDate) return "Returned";
  const due = new Date(record.dueDate);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return due < now ? "Overdue" : "Borrowed";
}

// --- Books API ---
export const getBooks = async () => {
  if (useDummyData) return { data: books.map((b) => ({ ...b })) };
  const response = await api.get("/books");
  return response;
};

export const getBookById = async (id) => {
  if (useDummyData) {
    const book = books.find((b) => b.id === Number(id));
    return { data: book ? { ...book } : null };
  }
  const response = await api.get(`/books/${id}`);
  return response;
};

export const createBook = async (book) => {
  if (useDummyData) {
    const totalCopies = Math.max(1, Number(book.totalCopies) || 1);
    const newBook = {
      id: Math.max(...books.map((b) => b.id), 0) + 1,
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category: book.category,
      totalCopies,
      availableCopies: totalCopies,
    };
    books.push(newBook);
    return { data: newBook };
  }
  const response = await api.post("/books", book);
  return response;
};

export const updateBook = async (id, book) => {
  if (useDummyData) {
    const index = books.findIndex((b) => b.id === Number(id));
    if (index === -1) throw new Error("Book not found");
    const current = books[index];
    const borrowed = current.totalCopies - current.availableCopies;
    const totalCopies = Math.max(1, Math.max(borrowed, Number(book.totalCopies) || current.totalCopies));
    const availableCopies = Math.min(
      current.availableCopies + (totalCopies - current.totalCopies),
      totalCopies
    );
    books[index] = {
      ...current,
      ...book,
      id: Number(id),
      totalCopies,
      availableCopies: Math.max(0, availableCopies),
    };
    return { data: books[index] };
  }
  const response = await api.put(`/books/${id}`, book);
  return response;
};

export const deleteBook = async (id) => {
  if (useDummyData) {
    books = books.filter((b) => b.id !== Number(id));
    return { data: {} };
  }
  const response = await api.delete(`/books/${id}`);
  return response;
};

// --- Members API ---
export const getMembers = async () => {
  if (useDummyData) {
    const list = members.map((m) => {
      const activeBorrowCount = borrowRecords.filter(
        (r) => r.memberId === m.id && !r.returnDate
      ).length;
      return { ...m, borrowedBooks: Array(activeBorrowCount).fill(null) };
    });
    return { data: list };
  }
  const response = await api.get("/members");
  return response;
};

export const getMemberById = async (id) => {
  if (useDummyData) {
    const member = members.find((m) => m.id === Number(id));
    return { data: member ? { ...member } : null };
  }
  const response = await api.get(`/members/${id}`);
  return response;
};

export const createMember = async (member) => {
  if (useDummyData) {
    const newMember = {
      ...member,
      id: Math.max(...members.map((m) => m.id), 0) + 1,
    };
    members.push(newMember);
    return { data: newMember };
  }
  const response = await api.post("/members", member);
  return response;
};

export const updateMember = async (id, member) => {
  if (useDummyData) {
    const index = members.findIndex((m) => m.id === Number(id));
    if (index === -1) throw new Error("Member not found");
    members[index] = { ...members[index], ...member, id: Number(id) };
    return { data: members[index] };
  }
  const response = await api.put(`/members/${id}`, member);
  return response;
};

export const deleteMember = async (id) => {
  if (useDummyData) {
    members = members.filter((m) => m.id !== Number(id));
    return { data: {} };
  }
  const response = await api.delete(`/members/${id}`);
  return response;
};

// --- Borrow Records API ---
export const getBorrowRecords = async () => {
  if (useDummyData) {
    const list = borrowRecords.map((r) => {
      const member = members.find((m) => m.id === r.memberId);
      const book = books.find((b) => b.id === r.bookId);
      const status = getDisplayStatus(r);
      return {
        ...r,
        memberName: member?.name ?? "",
        bookTitle: book?.title ?? "",
        status,
      };
    });
    return { data: list };
  }
  const response = await api.get("/borrow-records");
  return response;
};

export const getOverdueCount = async () => {
  if (useDummyData) {
    const list = borrowRecords.filter((r) => !r.returnDate && getDisplayStatus(r) === "Overdue");
    return { data: list.length };
  }
  const response = await api.get("/borrow-records/overdue-count");
  return response;
};

export const borrowBook = async (memberId, bookId) => {
  if (useDummyData) {
    const member = members.find((m) => m.id === Number(memberId));
    const book = books.find((b) => b.id === Number(bookId));
    if (!member || !book) throw new Error("Member or book not found");
    if (book.availableCopies < 1) throw new Error("No copies available");
    const borrowDate = new Date().toISOString().split("T")[0];
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);
    const dueDateStr = dueDate.toISOString().split("T")[0];
    const newRecord = {
      id: Math.max(...borrowRecords.map((r) => r.id), 0) + 1,
      memberId: Number(memberId),
      bookId: Number(bookId),
      borrowDate,
      dueDate: dueDateStr,
      returnDate: null,
      status: "Borrowed",
    };
    borrowRecords.push(newRecord);
    book.availableCopies -= 1;
    return { data: newRecord };
  }
  const response = await api.post("/borrow", { memberId, bookId });
  return response;
};

export const returnBorrowRecord = async (recordId) => {
  if (useDummyData) {
    const record = borrowRecords.find((r) => r.id === Number(recordId));
    if (!record) throw new Error("Record not found");
    if (record.returnDate) throw new Error("Already returned");
    const returnDate = new Date().toISOString().split("T")[0];
    record.returnDate = returnDate;
    record.status = "Returned";
    const book = books.find((b) => b.id === record.bookId);
    if (book) book.availableCopies += 1;
    return { data: record };
  }
  const response = await api.put(`/borrow-records/${recordId}/return`);
  return response;
};

// Legacy: get borrowed books by member (for any backward compat)
export const getBorrowedBooksByMember = async (memberId) => {
  if (useDummyData) {
    const memberRecords = borrowRecords.filter(
      (r) => r.memberId === Number(memberId) && !r.returnDate
    );
    const borrowed = memberRecords
      .map((r) => books.find((b) => b.id === r.bookId))
      .filter(Boolean);
    return { data: borrowed };
  }
  const response = await api.get(`/members/${memberId}/borrowed-books`);
  return response;
};

export const returnBook = async (memberId, bookId) => {
  if (useDummyData) {
    const record = borrowRecords.find(
      (r) => r.memberId === Number(memberId) && r.bookId === Number(bookId) && !r.returnDate
    );
    if (!record) throw new Error("Borrow record not found");
    return returnBorrowRecord(record.id);
  }
  const response = await api.delete(`/members/${memberId}/borrowed-books/${bookId}`);
  return response;
};

export default api;
