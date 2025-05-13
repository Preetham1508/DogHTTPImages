import React from "react";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <nav className="bg-white-800 text-black shadow p-4 flex justify-between items-center">
      <div 
        className="text-xl font-bold cursor-pointer"
        onClick={() => navigate("/")}
      >
        HTTP Dog Gallery
      </div>
      <div className="flex gap-4 items-center">
        {/* <button 
          className="hover:text-gray-300"
          onClick={() => navigate("/")}
        >
          Search
        </button>
        <button 
          className="hover:text-gray-300"
          onClick={() => navigate("/show")}
        >
          Saved Lists
        </button> */}
        <button 
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
