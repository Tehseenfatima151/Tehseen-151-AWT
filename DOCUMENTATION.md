# Biblionex – Smart Library Management System  
## Project Documentation

**Course:** Advance Web Technology (Lab Project)  
**Project Type:**  React.js Application  
**Version:** 1.0  

---

## 1. Introduction

**Biblionex** is a modern, responsive web application for managing a university or small library. It allows librarians to maintain a catalog of books, register members, and track book borrowings and returns with due dates and overdue status.

The application is built with **React.js** using functional components and hooks, with **Bootstrap 5** for layout and styling. It follows a clean, modular structure with a dedicated API service layer, so it can work with dummy data (no backend) or be connected to a REST API later.

---

## 2. Tech Stack

| Technology        | Purpose                          |
|-------------------|----------------------------------|
| React.js 18       | UI library, component-based     |
| Create React App  | Build tool and dev server         |
| React Router DOM  | Client-side routing              |
| Bootstrap 5       | Layout, components, responsive   |
| Axios             | HTTP requests (API layer)        |
| Plus Jakarta Sans | Typography (Google Fonts)        |

- **Components:** Functional components only  
- **State:** `useState`, `useEffect`  
- **Architecture:** Pages, reusable components, service layer, dummy data  

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

## 5. Project Structure

```
library-managemnet/
├── public/
│   ├── index.html
│   └── (comsats logo, favicon, etc.)
├── src/
│   ├── components/
│   │   ├── Navbar.js          # Top navigation + logo + links
│   │   ├── Sidebar.js         # Left sidebar (desktop)
│   │   ├── BookCard.js        # Single book card (title, author, copies, Edit/Delete)
│   │   ├── BookForm.js        # Add/Edit book form
│   │   ├── MemberForm.js      # Add/Edit member form
│   │   ├── SearchBar.js       # Search input for books
│   │   └── DashboardStats.js  # Stat cards for dashboard
│   ├── pages/
│   │   ├── Dashboard.js       # Overview with 5 stat cards
│   │   ├── BooksPage.js       # Book list, search, filter, CRUD
│   │   ├── MembersPage.js     # Member table, CRUD
│   │   └── BorrowedBooksPage.js  # Borrow form + borrow records table
│   ├── services/
│   │   └── api.js             # All API functions (books, members, borrow/return)
│   ├── data/
│   │   └── dummyData.js       # Sample books, members, borrow records
│   ├── App.js                 # Router + layout (Navbar, Sidebar, main content)
│   ├── App.css                # Custom styles (theme, cards, buttons)
│   ├── index.js               # React root
│   └── index.css              # Global base styles
├── screenshots/                # Output screenshots for README
├── README.md
├── DOCUMENTATION.md            # This file
├── package.json
└── .gitignore
```

---

## 6. Setup and Installation

### Prerequisites
- **Node.js** (v16 or higher)  
- **npm** (comes with Node.js)  

### Steps
1. Clone or download the repository.  
2. Open a terminal in the project folder (`library-managemnet`).  
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm start
   ```
5. Open [http://localhost:3000](http://localhost:3000) in the browser.  


---

## 7. How to Use the Application

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

## 8. API Service Layer

All server communication is in **`src/services/api.js`**:

- **Books:** `getBooks`, `getBookById`, `createBook`, `updateBook`, `deleteBook`  
- **Members:** `getMembers`, `getMemberById`, `createMember`, `updateMember`, `deleteMember`  
- **Borrow:** `getBorrowRecords`, `borrowBook`, `returnBorrowRecord`, `getOverdueCount`  

If **`REACT_APP_API_URL`** is not set, the app uses in-memory dummy data (same structure as above).  
To use a real backend, set in `.env`:

```
REACT_APP_API_URL=http://localhost:3001/api
```

Then implement the same endpoints on the server (see comments in `api.js` for expected request/response shape).

---

## 9. Routing

| Route             | Page             | Description              |
|-------------------|------------------|--------------------------|
| `/`               | Dashboard        | Overview stats            |
| `/books`          | BooksPage        | Book catalog and CRUD     |
| `/members`        | MembersPage      | Members table and CRUD    |
| `/borrowed-books` | BorrowedBooksPage| Borrow form + records     |

Implemented with **React Router DOM** in `App.js`.

---

## 10. Styling and UI

- **Theme:** Dark navbar and sidebar; light content area; indigo accent.  
- **Bootstrap 5:** Grid, cards, tables, forms, buttons, badges.  
- **Custom CSS:** `App.css` – card hover, stat cards, button styles (e.g. Edit/Delete/Return), form focus, table hover.  
- **Responsive:** Navbar collapses on small screens; sidebar hidden on mobile; grid and tables adapt.  

---



## 12. Future Enhancements (Optional)

- User authentication (login/logout)    
- Reports (e.g. most borrowed books, overdue list export)  
- Notifications or reminders for due dates  
- Fine calculation for overdue returns  

---

## 13. Conclusion

Biblionex is a complete front-end library management system with dashboard, book and member CRUD, and a full borrow/return workflow including due dates and overdue status. It is suitable as a Web Development lab project and can be extended with a backend and extra features as needed.

---

**Document Version:** 1.0  
**Last Updated:** 2026  
