import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";

const SearchPage = () => {
  const [filter, setFilter] = useState("");
  const [listName, setListName] = useState("");
  const [matchedCodes, setMatchedCodes] = useState([]);
  const navigate = useNavigate();

  const getMatchedCodes = (filter) => {
    const validCodes = [
      100, 101, 102,
      200, 201, 202, 203, 204, 205, 206, 207, 208, 226,
      300, 301, 302, 303, 304, 305, 307, 308,
      400, 401, 402, 403, 404, 405, 406, 407, 408, 409, 410, 411,
      412, 413, 414, 415, 416, 417, 418, 421, 422, 423, 424,
      425, 426, 428, 429, 431, 451,
      500, 501, 502, 503, 504, 505, 506, 507, 508, 510, 511
    ];

    if (!filter) return [];

    if (/^\d{3}$/.test(filter)) {
      // Exact match like 203
      const code = parseInt(filter);
      return validCodes.includes(code) ? [code] : [];
    } else if (/^\d{1}xx$/.test(filter)) {
      // Match like 2xx => 200-299
      const prefix = filter[0];
      return validCodes.filter((code) => code.toString().startsWith(prefix));
    } else if (/^\d{2}x$/.test(filter)) {
      // Match like 20x => 200-209
      const prefix = filter.slice(0, 2);
      return validCodes.filter((code) => code.toString().startsWith(prefix));
    }

    return [];
  };

  const handleSearch = () => {
    const matched = getMatchedCodes(filter);
    setMatchedCodes(matched);
  };

  const handleSave = async () => {
    if (!listName || matchedCodes.length === 0) {
      alert("Please enter a list name and filter some codes.");
      return;
    }
    const data = {
      name: listName,
      codes: matchedCodes,
      imageUrls: matchedCodes.map((code) => `https://http.dog/${code}.jpg`)
    };

    try {
        const token = localStorage.getItem('token');
        // console.log(token) 
        // const token  = localStorage.getItem(token);
      const res = await axios.post("http://localhost:5000/api/saveList", data, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      alert("List saved successfully!");
      setListName(""); // clear input
    } catch (err) {
      console.error("Error saving list:", err);
      alert("Failed to save the list.");
    }
  };

  const handleShowList = () => {
    navigate("/show");
  };

  return (
    <>
    <Navbar/>
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Search HTTP Dog Images</h1>

      {/* Filter input and Search button */}
      <div className="mb-4 flex gap-4">
        <input
          type="text"
          placeholder="Enter code (e.g., 203, 2xx, 20x)"
          className="border p-2 flex-1"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <button 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" 
          onClick={handleSearch}
        >
          Search
        </button>
      </div>

      {/* Results grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 my-6">
        {matchedCodes.map((code) => (
          <div key={code} className="text-center">
            <img 
              src={`https://http.dog/${code}.jpg`} 
              alt={`HTTP ${code}`} 
              className="rounded shadow" 
            />
            <p className="mt-2 font-medium">{code}</p>
          </div>
        ))}
      </div>

      {/* Save input and buttons */}
      <div className="mt-6 flex gap-4 items-center">
        <input
          type="text"
          placeholder="Enter list name"
          className="border p-2 flex-1"
          value={listName}
          onChange={(e) => setListName(e.target.value)}
        />
        <button 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" 
          onClick={handleSave}
        >
          Save List
        </button>
        <button 
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          onClick={handleShowList}
        >
          Show List
        </button>
      </div>
    </div>
    </>
  );
};

export default SearchPage;