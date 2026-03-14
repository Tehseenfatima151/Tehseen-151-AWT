import React, { useState, useEffect } from "react";

const categories = ["Programming", "Software Engineering", "Computer Science", "Web Development", "Other"];

const BookForm = ({ book, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    category: categories[0],
    totalCopies: 1,
  });

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title || "",
        author: book.author || "",
        isbn: book.isbn || "",
        category: book.category || categories[0],
        totalCopies: Math.max(1, Number(book.totalCopies) || 1),
      });
    }
  }, [book]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Math.max(1, parseInt(value, 10) || 1) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="card card-app border-0 p-4 p-lg-5">
      <h5 className="fw-bold mb-4">{book ? "Edit Book" : "Add New Book"}</h5>
      <div className="row g-3">
        <div className="col-12">
          <label className="form-label form-label-app">Title</label>
          <input
            type="text"
            className="form-control form-control-app"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label form-label-app">Author</label>
          <input
            type="text"
            className="form-control form-control-app"
            name="author"
            value={formData.author}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label form-label-app">ISBN</label>
          <input
            type="text"
            className="form-control form-control-app"
            name="isbn"
            value={formData.isbn}
            onChange={handleChange}
            required
          />
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label form-label-app">Category</label>
          <select
            className="form-select form-select-app"
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label form-label-app">Total Copies</label>
          <input
            type="number"
            min="1"
            className="form-control form-control-app"
            name="totalCopies"
            value={formData.totalCopies}
            onChange={handleChange}
            required
          />
          {book && (
            <small className="text-secondary">
              Available now: {book.availableCopies ?? 0} (managed by borrow/return)
            </small>
          )}
        </div>
      </div>
      <div className="d-flex gap-2 mt-4">
        <button type="submit" className="btn btn-app-primary">
          {book ? "Update" : "Add"} Book
        </button>
        <button type="button" className="btn btn-app-outline" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
};

export default BookForm;
