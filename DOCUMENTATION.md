# Biblionex – Smart Library Management System  
## Project Documentation

**Course:**    Advance web Technology (Lab Project)  
**Project Type:** Full-stack Web Application (React + Node.js + SQLite)  
**Version:** 1.0  

---

## 1. Introduction

**Biblionex** is a modern, responsive web application for managing a university or small library. It allows librarians to maintain a catalog of books, register members, and track book borrowings and returns with due dates and overdue status.

The application uses a **full-stack** architecture: **React.js** for the frontend, **Node.js (Express)** for the backend REST API, and **SQLite** as the database. The frontend is built with functional components and hooks, **Bootstrap 5** for layout and styling, and **Axios** for API calls. All data is stored in SQLite and accessed through the Node.js backend.

---

## 2. Tech Stack

### 2.1 Frontend
| Technology        | Purpose                          |
|-------------------|----------------------------------|
| React.js 18       | UI library, component-based     |
| Create React App  | Build tool and dev server         |
| React Router DOM  | Client-side routing              |
| Bootstrap 5       | Layout, components, responsive   |
| Axios             | HTTP requests to backend API     |
| Plus Jakarta Sans | Typography (Google Fonts)        |

### 2.2 Backend
| Technology   | Purpose                          |
|--------------|----------------------------------|
| Node.js      | Runtime for server               |
| Express.js   | REST API framework               |
| SQLite       | Database (file-based)            |
| better-sqlite3 / sqlite3 | SQLite driver for Node.js |

### 2.3 Architecture Summary
- **Frontend:** React (functional components, `useState`, `useEffect`)  
- **Backend:** Node.js + Express (REST API)  
- **Database:** SQLite (persistent storage)  
- **Communication:** Frontend → Axios → Backend API → SQLite  

---

## 3. Features

### 3.1 Dashboard
- Summary cards: **Total Books**, **Total Members**, **Borrowed** (active issues), **Available Copies**, **Overdue Books**
- Real-time counts from current data

### 3.2 Book Management
- **Add book:** Title, author, ISBN, category, total copies  
- **Edit book:** Update details; total copies can be increased (available copies adjusted)  
- **Delete book:** Remove from catalog  
- **View list:** All books in a responsive card grid  
- **Search:** By title, author, or category  
- **Filter:** By category (dropdown)  
- **Copies:** Each book has `totalCopies` and `availableCopies`; availability is shown on cards  

### 3.3 Member Management
- **Register member:** Name, email, membership date  
- **Edit / Delete member**  
- **View list:** Table with name, email, membership date, number of books currently borrowed  

### 3.4 Borrow / Return System
- **Borrow:** Select member and book (only books with `availableCopies > 0`); a borrow record is created with **borrow date** and **due date** (14 days later)  
- **Return:** From the borrow records table, click **Return**; return date is set and book copies are updated  
- **Borrow records table:** Member name, book title, borrow date, due date, return date, **status** (Borrowed / Returned / **Overdue**)  
- **Overdue:** If current date > due date and book not returned, status is shown as **Overdue**  
- **Dashboard:** Overdue count shown in a separate card  

---

## 4. Data Models

### 4.1 Book
| Field             | Type    | Description                    |
|-------------------|---------|--------------------------------|
| id                | number  | Unique identifier              |
| title             | string  | Book title                     |
| author            | string  | Author name                    |
| isbn              | string  | ISBN                           |
| category          | string  | e.g. Programming, Computer Science |
| totalCopies       | number  | Total copies in library        |
| availableCopies   | number  | Copies currently available     |

- On **borrow:** `availableCopies` decreases by 1  
- On **return:** `availableCopies` increases by 1  

### 4.2 Member
| Field           | Type   | Description        |
|-----------------|--------|--------------------|
| id              | number | Unique identifier  |
| name            | string | Full name          |
| email           | string | Email address      |
| membershipDate  | string | Date (YYYY-MM-DD)  |

### 4.3 Borrow Record
| Field      | Type   | Description                                  |
|------------|--------|----------------------------------------------|
| id         | number | Unique identifier                             |
| memberId   | number | Reference to member                           |
| bookId     | number | Reference to book                            |
| borrowDate | string | Date borrowed (YYYY-MM-DD)                   |
| dueDate    | string | Due date (14 days after borrow)              |
| returnDate | string | Date returned (null if not yet returned)     |
| status     | string | Borrowed / Returned / Overdue (computed)     |

- **Overdue:** when `returnDate` is null and current date > `dueDate`  

---

## 5. Backend (Node.js + Express)

The backend is built with **Node.js** and **Express.js**. It provides a REST API that the React frontend calls using Axios. All business logic (add book, borrow, return, etc.) runs on the server, and data is stored in **SQLite**.

### 5.1 Why Node.js and Express?
- **Node.js:** JavaScript runtime; same language as frontend, easy to maintain.
- **Express:** Lightweight, widely used framework for REST APIs (GET, POST, PUT, DELETE).
- **REST:** Clear endpoints (e.g. `GET /api/books`, `POST /api/books`) for the frontend to use.

### 5.2 Backend Responsibilities
- Serve REST API endpoints for books, members, and borrow records.
- Connect to SQLite database (read/write).
- Validate input and enforce rules (e.g. cannot borrow if no copies available).
- Compute due dates (e.g. 14 days after borrow) and overdue status.

### 5.3 API Endpoints (Backend)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/books` | Get all books |
| GET    | `/api/books/:id` | Get one book by id |
| POST   | `/api/books` | Add new book |
| PUT    | `/api/books/:id` | Update book |
| DELETE | `/api/books/:id` | Delete book |
| GET    | `/api/members` | Get all members |
| GET    | `/api/members/:id` | Get one member |
| POST   | `/api/members` | Register new member |
| PUT    | `/api/members/:id` | Update member |
| DELETE | `/api/members/:id` | Delete member |
| GET    | `/api/borrow-records` | Get all borrow records (with member name, book title) |
| POST   | `/api/borrow` | Create borrow (body: memberId, bookId) – sets due date 14 days later |
| PUT    | `/api/borrow-records/:id/return` | Mark record as returned, update return date and book copies |

The React app’s `api.js` calls these endpoints when `REACT_APP_API_URL` is set to the backend base URL (e.g. `http://localhost:3001`).

---

## 6. Database (SQLite)

**SQLite** is used as the database. It is file-based (no separate database server), which is suitable for a small to medium library and for development/submission.

### 6.1 Why SQLite?
- No separate server; single file (e.g. `library.db`).
- Easy to set up and run with Node.js.
- Good for learning and for projects that need a real database without heavy setup.

### 6.2 Database Schema (Tables)

**Table: books**
| Column           | Type    | Description                |
|------------------|---------|----------------------------|
| id               | INTEGER | Primary key, auto-increment |
| title            | TEXT    | Book title                 |
| author           | TEXT    | Author name                |
| isbn             | TEXT    | ISBN                       |
| category         | TEXT    | Category                   |
| total_copies     | INTEGER | Total copies               |
| available_copies | INTEGER | Copies currently available |

**Table: members**
| Column           | Type    | Description                |
|------------------|---------|----------------------------|
| id               | INTEGER | Primary key, auto-increment |
| name             | TEXT    | Full name                  |
| email            | TEXT    | Email address              |
| membership_date  | TEXT    | Date (YYYY-MM-DD)          |

**Table: borrow_records**
| Column      | Type    | Description                          |
|-------------|---------|--------------------------------------|
| id          | INTEGER | Primary key, auto-increment          |
| member_id   | INTEGER | Foreign key → members.id             |
| book_id     | INTEGER | Foreign key → books.id               |
| borrow_date | TEXT    | Date borrowed (YYYY-MM-DD)           |
| due_date    | TEXT    | Due date (14 days after borrow)      |
| return_date | TEXT    | Date returned (NULL if not returned)  |

- **Status** (Borrowed / Returned / Overdue) is computed in the backend or frontend from `return_date` and `due_date`, not stored as a column.
- On **borrow:** insert row in `borrow_records`, decrement `books.available_copies`.
- On **return:** set `borrow_records.return_date`, increment `books.available_copies`.

### 6.3 Connection from Node.js
The backend uses a Node.js SQLite driver (e.g. **better-sqlite3** or **sqlite3**) to open the database file and run SQL queries (SELECT, INSERT, UPDATE, DELETE) for books, members, and borrow records.

---

## 7. Project Structure

```
library-managemnet/
├── public/                     # Frontend static assets
│   ├── index.html
│   └── (comsats logo, favicon, etc.)
├── src/                        # React frontend
│   ├── components/
│   │   ├── Navbar.js           # Top navigation + logo + links
│   │   ├── Sidebar.js          # Left sidebar (desktop)
│   │   ├── BookCard.js         # Single book card
│   │   ├── BookForm.js         # Add/Edit book form
│   │   ├── MemberForm.js       # Add/Edit member form
│   │   ├── SearchBar.js        # Search input for books
│   │   └── DashboardStats.js   # Stat cards for dashboard
│   ├── pages/
│   │   ├── Dashboard.js        # Overview with 5 stat cards
│   │   ├── BooksPage.js        # Book list, search, filter, CRUD
│   │   ├── MembersPage.js      # Member table, CRUD
│   │   └── BorrowedBooksPage.js  # Borrow form + borrow records table
│   ├── services/
│   │   └── api.js              # Axios calls to Node.js backend API
│   ├── data/
│   │   └── dummyData.js        # Sample data (fallback / seeding)
│   ├── App.js                  # Router + layout
│   ├── App.css                 # Custom styles
│   ├── index.js                # React root
│   └── index.css               # Global base styles
├── server/                     # Node.js backend (Express + SQLite)
│   ├── index.js                # Express app, routes, server start
│   ├── db.js                   # SQLite connection and init
│   ├── routes/
│   │   ├── books.js            # /api/books endpoints
│   │   ├── members.js          # /api/members endpoints
│   │   └── borrow.js           # /api/borrow-records, /api/borrow endpoints
│   └── library.db              # SQLite database file (created on first run)
├── screenshots/
├── README.md
├── DOCUMENTATION.md            # This file
├── package.json                # Frontend dependencies + scripts
└── .gitignore
```

---

## 8. Setup and Installation

### Prerequisites
- **Node.js** (v16 or higher)  
- **npm** (comes with Node.js)  

### Steps

**1. Clone or download the repository.**

**2. Install frontend dependencies and start React (frontend):**
```bash
npm install
npm start
```
- Frontend runs at [http://localhost:3000](http://localhost:3000).

**3. Install backend dependencies and start Node.js server:**
```bash
cd server
npm install
node index.js
```
- Backend API runs at [http://localhost:3001](http://localhost:3001) (or port set in server).
- On first run, SQLite creates `library.db` and tables (books, members, borrow_records) if they do not exist.

**4. Connect frontend to backend:**  
In the React project root, create a `.env` file with:
```
REACT_APP_API_URL=http://localhost:3001/api
```
Then restart the React app (`npm start`). The app will then use the Node.js API and SQLite database instead of dummy data.

---

## 9. How to Use the Application

### Dashboard
- View total books, members, borrowed count, available copies, and overdue books.  
- Use the top navbar or left sidebar to go to other sections.  

### Books
- **Add Book:** Click “Add Book”, fill title, author, ISBN, category, total copies; submit.  
- **Search:** Type in the search bar to filter by title, author, or category.  
- **Filter:** Use the category dropdown to show only a specific category.  
- **Edit:** Click “Edit” on a card, change details, then “Update Book”.  
- **Delete:** Click “Delete” on a card and confirm.  

### Members
- **Register:** Click “Register Member”, enter name, email, membership date; submit.  
- **Edit / Delete:** Use the buttons in the table row.  

### Borrowed Books
- **Borrow:** Choose a member and a book (only those with available copies), then “Borrow Book”. Due date is set to 14 days later.  
- **View records:** The table shows all borrow records with member, book, dates, and status.  
- **Return:** Click “Return” on a row where the book is not yet returned.  

---

## 10. API Service Layer (Frontend)

All communication with the backend is in **`src/services/api.js`** using **Axios**:

- **Books:** `getBooks`, `getBookById`, `createBook`, `updateBook`, `deleteBook`  
- **Members:** `getMembers`, `getMemberById`, `createMember`, `updateMember`, `deleteMember`  
- **Borrow:** `getBorrowRecords`, `borrowBook`, `returnBorrowRecord`, `getOverdueCount`  

When **`REACT_APP_API_URL`** is set (e.g. `http://localhost:3001/api`), these functions call the **Node.js backend**; the backend reads/writes **SQLite**. When not set, the frontend can fall back to in-memory dummy data for demo.

---

## 11. Routing

| Route             | Page             | Description              |
|-------------------|------------------|--------------------------|
| `/`               | Dashboard        | Overview stats            |
| `/books`          | BooksPage        | Book catalog and CRUD     |
| `/members`        | MembersPage      | Members table and CRUD    |
| `/borrowed-books` | BorrowedBooksPage| Borrow form + records     |

Implemented with **React Router DOM** in `App.js`.

---

## 12. Styling and UI

- **Theme:** Dark navbar and sidebar; light content area; indigo accent.  
- **Bootstrap 5:** Grid, cards, tables, forms, buttons, badges.  
- **Custom CSS:** `App.css` – card hover, stat cards, button styles (e.g. Edit/Delete/Return), form focus, table hover.  
- **Responsive:** Navbar collapses on small screens; sidebar hidden on mobile; grid and tables adapt.  

---



## 13. Dummy Data (Fallback)

The file **`src/data/dummyData.js`** contains sample books, members, and borrow records. It is used when the frontend runs without a backend (e.g. for quick demo or when `REACT_APP_API_URL` is not set). When the Node.js backend and SQLite are used, the backend can optionally seed the database from similar data on first run.

---

## 14. Future Enhancements (Optional)

- User authentication (login/logout)  
- Reports (e.g. most borrowed books, overdue list export)  
- Notifications or reminders for due dates  
- Fine calculation for overdue returns  

---

## 15. Conclusion

Biblionex is a **full-stack** library management system: **React.js** frontend, **Node.js (Express)** backend, and **SQLite** database. It includes a dashboard, book and member CRUD, and a full borrow/return workflow with due dates and overdue status. The use of Node.js and SQLite provides a real backend and persistent storage, making it suitable as a Web Development lab project.

---

**Document Version:** 1.0  
**Last Updated:** 2026  
