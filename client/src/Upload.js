import React, { useState } from 'react';
import axios from 'axios';

export default function Upload() {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) return alert('Please select a file.');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('author', author);
    formData.append('description', description);

    try {
      const res = await axios.post('http://localhost:5000/api/upload', formData);
      alert(res.data.message);
    } catch (err) {
      console.error(err);
      alert('Upload failed.');
    }
  };

  return (
    <div>
      <h2>Upload Thesis</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} /><br/>
        <input type="text" placeholder="Author" value={author} onChange={e => setAuthor(e.target.value)} /><br/>
        <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} /><br/>
        <input type="file" onChange={e => setFile(e.target.files[0])} /><br/>
        <button type="submit">Upload</button>
      </form>
    </div>
  );
}
