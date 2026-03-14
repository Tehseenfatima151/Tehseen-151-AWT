/**
 * Dummy data for Library Management System
 * Book model: id, title, author, isbn, category, totalCopies, availableCopies
 * BorrowRecord: id, memberId, bookId, borrowDate, dueDate, returnDate, status (Borrowed | Returned | Overdue)
 */

const today = new Date();
const formatDate = (d) => d.toISOString().split("T")[0];
const addDays = (date, days) => {
  const r = new Date(date);
  r.setDate(r.getDate() + days);
  return r;
};

export const dummyBooks = [
  { id: 1, title: "Clean Code", author: "Robert C. Martin", isbn: "978-0132350884", category: "Programming", totalCopies: 3, availableCopies: 2 },
  { id: 2, title: "Design Patterns", author: "Gang of Four", isbn: "978-0201633610", category: "Software Engineering", totalCopies: 2, availableCopies: 1 },
  { id: 3, title: "The Pragmatic Programmer", author: "David Thomas", isbn: "978-0135957059", category: "Programming", totalCopies: 4, availableCopies: 2 },
  { id: 4, title: "Introduction to Algorithms", author: "Thomas H. Cormen", isbn: "978-0262033848", category: "Computer Science", totalCopies: 2, availableCopies: 2 },
  { id: 5, title: "JavaScript: The Good Parts", author: "Douglas Crockford", isbn: "978-0596517748", category: "Programming", totalCopies: 1, availableCopies: 0 },
  { id: 6, title: "React in Action", author: "Mark Tielens Thomas", isbn: "978-1617293856", category: "Web Development", totalCopies: 3, availableCopies: 3 },
  { id: 7, title: "Operating System Concepts", author: "Abraham Silberschatz", isbn: "978-1118063330", category: "Computer Science", totalCopies: 3, availableCopies: 3 },
  { id: 8, title: "Computer Networks", author: "Andrew S. Tanenbaum", isbn: "978-0132126953", category: "Computer Science", totalCopies: 2, availableCopies: 2 },
  { id: 9, title: "Database System Concepts", author: "Abraham Silberschatz", isbn: "978-0078022159", category: "Computer Science", totalCopies: 2, availableCopies: 2 },
  { id: 10, title: "Artificial Intelligence: A Modern Approach", author: "Stuart Russell", isbn: "978-0136042594", category: "Computer Science", totalCopies: 2, availableCopies: 2 },
  { id: 11, title: "Compilers: Principles, Techniques, and Tools", author: "Alfred V. Aho", isbn: "978-0321486813", category: "Computer Science", totalCopies: 2, availableCopies: 2 },
  { id: 12, title: "Computer Organization and Design", author: "David A. Patterson", isbn: "978-0128122754", category: "Computer Science", totalCopies: 3, availableCopies: 3 },
];

export const dummyMembers = [
  { id: 1, name: "Alice Johnson", email: "alice.johnson@university.edu", membershipDate: "2023-01-15" },
  { id: 2, name: "Bob Smith", email: "bob.smith@university.edu", membershipDate: "2023-03-22" },
  { id: 3, name: "Carol Williams", email: "carol.williams@university.edu", membershipDate: "2023-06-10" },
  { id: 4, name: "David Brown", email: "david.brown@university.edu", membershipDate: "2024-01-08" },
];

// Borrow records: borrowDate, dueDate (14 days later), returnDate (null if not returned), status
const past30 = addDays(today, -30);
const past20 = addDays(today, -20);
const past10 = addDays(today, -10);
const past5 = addDays(today, -5);
const yesterday = addDays(today, -1);

export const dummyBorrowRecords = [
  { id: 1, memberId: 1, bookId: 2, borrowDate: formatDate(past30), dueDate: formatDate(addDays(past30, 14)), returnDate: null, status: "Borrowed" },
  { id: 2, memberId: 2, bookId: 5, borrowDate: formatDate(past20), dueDate: formatDate(addDays(past20, 14)), returnDate: null, status: "Borrowed" },
  { id: 3, memberId: 1, bookId: 3, borrowDate: formatDate(past10), dueDate: formatDate(addDays(past10, 14)), returnDate: formatDate(past5), status: "Returned" },
  { id: 4, memberId: 3, bookId: 1, borrowDate: formatDate(past5), dueDate: formatDate(addDays(past5, 14)), returnDate: null, status: "Borrowed" },
  { id: 5, memberId: 2, bookId: 3, borrowDate: formatDate(yesterday), dueDate: formatDate(addDays(yesterday, 14)), returnDate: null, status: "Borrowed" },
];
