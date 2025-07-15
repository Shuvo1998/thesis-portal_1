import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ThesisList = () => {
  const [theses, setTheses] = useState([]);
  const [search, setSearch] = useState('');

  const fetchTheses = () => {
    axios.get(`http://localhost:5000/api/theses?search=${search}`)
      .then(res => {
        console.log('Fetched theses:', res.data); 
        setTheses(res.data)})
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchTheses();
  }, [search]);

  const handleStatusChange = (id, newStatus) => {
    axios.put(`http://localhost:5000/api/thesis/${id}/status`, { status: newStatus })
      .then(() => {
        setSearch(''); // Reset search to refresh the list
        fetchTheses()})
      .catch(err => console.error(err));
  };
const handleDelete = (id) => {
  axios.delete(`http://localhost:5000/api/thesis/${id}`)
    .then(() => fetchTheses())
    .catch(err => console.error(err));
};

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Uploaded Theses</h2>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by title, author, keywords"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2"
        />
        <button
          onClick={fetchTheses}
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Search
        </button>
      </div>

      <table className="table-auto w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="px-4 py-2 border">Title</th>
            <th className="px-4 py-2 border">Author</th>
            <th className="px-4 py-2 border">Uploaded At</th>
            <th className="px-4 py-2 border">Status</th>
            <th className="px-4 py-2 border">Action</th>
            <th className="px-4 py-2 border">Download</th>
          </tr>
        </thead>
        <tbody>
          {theses.map((thesis) => (
            <tr key={thesis._id}>
              <td className="px-4 py-2 border">{thesis.title}</td>
              <td className="px-4 py-2 border">{thesis.author}</td>
              <td className="px-4 py-2 border">
                {new Date(thesis.uploadedAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-2 border">{thesis.status || 'pending'}</td>
              <td className="px-4 py-2 border">
                <button
                  onClick={() => handleStatusChange(thesis._id, 'approved')}
                  className="bg-green-500 text-white px-2 py-1 mr-2 rounded"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleStatusChange(thesis._id, 'rejected')}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Reject
                </button>
              </td>
              <button
  onClick={() => handleDelete(thesis._id)}
  className="bg-yellow-500 text-white px-2 py-1 ml-2 rounded"
>
  Delete
</button>
              <td className="px-4 py-2 border">
        <a
          href={`http://localhost:5000/${thesis.filePath}`}
          download
          className="bg-blue-500 text-white px-2 py-1 rounded"
        >
          Download
        </a>
      </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ThesisList;
