import React, { useState, useEffect } from "react";
import BookCard from "../components/BookCard";
import BookForm from "../components/BookForm";
import SearchBar from "../components/SearchBar";
import { getBooks, createBook, updateBook, deleteBook } from "../services/api";

const BooksPage = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  const loadBooks = async () => {
    try {
      const res = await getBooks();
      setBooks(res.data || []);
    } catch (err) {
      console.error("Failed to load books", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  useEffect(() => {
    let result = books;
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      result = result.filter(
        (b) =>
          b.title?.toLowerCase().includes(q) ||
          b.author?.toLowerCase().includes(q) ||
          b.category?.toLowerCase().includes(q)
      );
    }
    if (categoryFilter && categoryFilter !== "All") {
      result = result.filter((b) => b.category === categoryFilter);
    }
    setFilteredBooks(result);
  }, [books, searchQuery, categoryFilter]);

  const categories = ["All", ...new Set(books.map((b) => b.category).filter(Boolean))];

  const handleSearch = (query) => setSearchQuery(query);

  const handleAddBook = () => {
    setEditingBook(null);
    setShowForm(true);
  };

  const handleEditBook = (book) => {
    setEditingBook(book);
    setShowForm(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingBook) {
        await updateBook(editingBook.id, formData);
      } else {
        await createBook(formData);
      }
      setShowForm(false);
      setEditingBook(null);
      loadBooks();
    } catch (err) {
      console.error("Failed to save book", err);
      alert("Failed to save book. Please try again.");
    }
  };

  const handleDeleteBook = async (book) => {
    if (!window.confirm(`Delete "${book.title}"?`)) return;
    try {
      await deleteBook(book.id);
      loadBooks();
    } catch (err) {
      console.error("Failed to delete book", err);
      alert("Failed to delete book.");
    }
  };

  return (
    <div className="container-fluid px-0">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <header className="page-header mb-0">
          <h1>Books</h1>
          <p>Manage your library catalog</p>
        </header>
        <button type="button" className="btn btn-app-primary rounded-3 px-4" onClick={handleAddBook}>
          + Add Book
        </button>
      </div>

      {showForm && (
        <div className="mb-4">
          <BookForm
            book={editingBook}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingBook(null);
            }}
          />
        </div>
      )}

      <div className="row g-3 mb-4">
        <div className="col-12 col-md-6 col-lg-4">
          <SearchBar onSearch={handleSearch} placeholder="Search by title, author, category..." />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <select
            className="form-select form-select-app"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-wrap">
          <div className="spinner-border spinner-app" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="row g-3 g-md-4">
          {filteredBooks.length === 0 ? (
            <div className="col-12">
              <div className="empty-state">No books found.</div>
            </div>
          ) : (
            filteredBooks.map((book) => (
              <div key={book.id} className="col-12 col-sm-6 col-lg-4 col-xl-3">
                <BookCard
                  book={book}
                  onEdit={handleEditBook}
                  onDelete={handleDeleteBook}
                />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default BooksPage;
