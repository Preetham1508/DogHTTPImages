import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';

const ShowList = () => {
  const [lists, setLists] = useState([]);
  const [expandedList, setExpandedList] = useState(null);
  const [editingList, setEditingList] = useState(null);
  const [newListName, setNewListName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchLists();
  }, []);
  const token = localStorage.getItem('token');
  const fetchLists = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/getLists',{
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setLists(response.data);
    } catch (error) {
      console.error('Error fetching lists:', error);
    }
  };

  const toggleList = (listId) => {
    setExpandedList(expandedList === listId ? null : listId);
    setEditingList(null); // Reset editing when collapsing
  };

  const handleDelete = async (listId) => {
    try {
      if (window.confirm('This will delete the entire list. Continue?')) {
        await axios.delete(`http://localhost:5000/api/deleteList/${listId}`,{
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      } else {
        return; // User canceled
      }
      // await axios.delete(`http://localhost:5000/api/deleteList/${listId}`);
      fetchLists();
    } catch (error) {
      console.error('Error deleting list:', error);
    }
  };

  const handleEdit = (list) => {
    setEditingList(list._id);
    setNewListName(list.name);
  };

  // const handleRemoveImage = async (listId, index) => {
  //   try {
  //     const listToUpdate = lists.find(list => list._id === listId);
  //     const updatedCodes = [...listToUpdate.codes];
  //     const updatedImageUrls = [...listToUpdate.imageUrls];
      
  //     updatedCodes.splice(index, 1);
  //     updatedImageUrls.splice(index, 1);
      
  //     await axios.put(`http://localhost:5000/api/updateList/${listId}`, {
  //       codes: updatedCodes,
  //       imageUrls: updatedImageUrls
  //     });
      
  //     fetchLists(); // Refresh the lists
  //   } catch (error) {
  //     console.error('Error removing image:', error);
  //   }
  // };
  const handleRemoveImage = async (listId, index) => {
    try {
      const listToUpdate = lists.find(list => list._id === listId);
      const updatedCodes = [...listToUpdate.codes];
      const updatedImageUrls = [...listToUpdate.imageUrls];
      
      updatedCodes.splice(index, 1);
      updatedImageUrls.splice(index, 1);
      
      // Check if this was the last image
      if (updatedCodes.length === 0) {
        // Confirm before deleting the entire list
        if (window.confirm('This will delete the entire list as it will be empty. Continue?')) {
          await axios.delete(`http://localhost:5000/api/deleteList/${listId}`,{
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
        } else {
          return; // User canceled
        }
      } else {
        // Otherwise just update the list
        await axios.put(`http://localhost:5000/api/updateList/${listId}`, {
          codes: updatedCodes,
          imageUrls: updatedImageUrls
        },{
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
      
      fetchLists(); // Refresh the lists
      setEditingList(null); // Exit edit mode
    } catch (error) {
      console.error('Error removing image:', error);
    }
  };

  const handleUpdateName = async (listId) => {
    try {
      await axios.put(`http://localhost:5000/api/updateList/${listId}`, {
        name: newListName
      },{
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setEditingList(null);
      fetchLists();
    } catch (error) {
      console.error('Error updating list name:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <>
    <Navbar />
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Saved Lists</h1>
      
      <button 
        onClick={() => navigate('/search')}
        className="mb-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Back to Search
      </button>

      <div className="space-y-4">
        {lists.map((list) => (
          <div key={list._id} className="border rounded-lg overflow-hidden">
            <div 
              className="p-4 bg-gray-100 hover:bg-gray-200 cursor-pointer flex justify-between items-center"
              onClick={() => toggleList(list._id)}
            >
              <span className="font-medium">{list.name}</span>
              <span className="text-gray-500 text-sm">
                {expandedList === list._id ? '^' : '>'}
              </span>
            </div>

            {expandedList === list._id && (
              <div className="p-4 border-t">
                <div className="mb-4 text-sm text-gray-600">
                  <p>Created At: {formatDate(list.createdAt)}</p>
                  <button 
                    className="mt-2 text-blue-500 hover:text-blue-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(list);
                    }}
                  >
                    Edit
                  </button>
                </div>

                {editingList === list._id && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="text"
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                        className="border p-2 flex-1"
                        placeholder="Enter new list name"
                      />
                      <button
                        className="bg-green-500 text-white px-3 py-1 rounded"
                        onClick={() => handleUpdateName(list._id)}
                      >
                        Update
                      </button>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      Click the red X to remove images
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {list.imageUrls.map((url, index) => (
                    <div key={index} className="relative">
                      {editingList === list._id && (
                        <button
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                          onClick={() => handleRemoveImage(list._id, index)}
                        >
                          -
                        </button>
                      )}
                      <img 
                        src={url} 
                        alt={`HTTP ${list.codes[index]}`} 
                        className="rounded shadow w-full h-auto"
                      />
                      <p className="mt-2 font-medium">{list.codes[index]}</p>
                    </div>
                  ))}
                </div>

                <button 
                  className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  onClick={() => handleDelete(list._id)}
                >
                  Delete List
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
    </>
  );
};

export default ShowList;