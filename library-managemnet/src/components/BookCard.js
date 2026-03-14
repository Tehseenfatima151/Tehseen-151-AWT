import React from "react";

const BookCard = ({ book, onEdit, onDelete }) => {
  const total = Number(book.totalCopies) || 0;
  const available = Number(book.availableCopies) ?? 0;
  const isAvailable = available > 0;

  return (
    <div className="card book-card-app">
      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-2 gap-2">
          <h6 className="card-title mb-0 flex-grow-1">{book.title}</h6>
          <span
            className={`badge badge-status rounded-pill flex-shrink-0 ${
              isAvailable ? "badge-available" : "badge-borrowed"
            }`}
          >
            {isAvailable ? "Available" : "Borrowed"}
          </span>
        </div>
        <p className="card-meta mb-1">
          <strong>Author:</strong> {book.author}
        </p>
        <p className="card-meta mb-1">
          <strong>Category:</strong> {book.category}
        </p>
        <p className="card-meta mb-1">
          <strong>Copies:</strong> {available} / {total} available
        </p>
        <p className="card-meta mb-3">
          <strong>ISBN:</strong> {book.isbn}
        </p>
        <div className="mt-auto d-flex gap-2">
          <button
            type="button"
            className="btn btn-sm btn-edit flex-grow-1"
            onClick={() => onEdit(book)}
          >
            Edit
          </button>
          <button
            type="button"
            className="btn btn-sm btn-delete flex-grow-1"
            onClick={() => onDelete(book)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
