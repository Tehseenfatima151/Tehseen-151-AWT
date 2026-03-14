import React, { useState } from "react";

const SearchBar = ({ onSearch, placeholder = "Search books..." }) => {
  const [query, setQuery] = useState("");

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    onSearch(value);
  };

  return (
    <div className="search-bar-app">
      <div className="input-group">
        <span className="input-group-text">🔍</span>
        <input
          type="text"
          className="form-control"
          placeholder={placeholder}
          value={query}
          onChange={handleChange}
          aria-label="Search"
        />
      </div>
    </div>
  );
};

export default SearchBar;
