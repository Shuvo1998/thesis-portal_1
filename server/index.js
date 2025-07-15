const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const { spawn } = require('child_process');



mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});


const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/thesisDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));
  
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
// Thesis Schema
const thesisSchema = new mongoose.Schema({
  title: String,
  author: String,
  description: String,
  filePath: String,
  keywords: [String],
  uploadedAt: { type: Date, default: Date.now },
});
const Thesis = mongoose.model('Thesis', thesisSchema);

// Multer Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = './uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Upload Route
app.post('/api/upload', upload.single('file'), async (req, res) => {
  const { title, author, description } = req.body;
  const filePath = req.file.path;

  // Python Plagiarism Check
  const plagiarism = spawn('python', ['plagiarism_check.py', filePath]);
  

  let plagiarismResult = '';

  plagiarism.stdout.on('data', (data) => {
    plagiarismResult += data.toString();
  });

  plagiarism.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  plagiarism.on('close', async (code) => {
    console.log(`Plagiarism script exited with code ${code}`);
    const result = JSON.parse(plagiarismResult);
    const similarity = result.max_similarity;

    console.log(`Max Similarity: ${similarity}`);

    if (similarity > 0.7) {
      return res.json({ message: 'Plagiarism detected! Similarity: ' + similarity });
    }

    // ✅ Plagiarism OK ➜ Then Extract Keywords
    const python = spawn('python', ['extract_keywords.py', filePath]);

    let dataToSend = '';

    python.stdout.on('data', (data) => {
      dataToSend += data.toString();
    });

    python.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    python.on('close', async (code) => {
      console.log(`Python script exited with code ${code}`);
      const keywords = JSON.parse(dataToSend);

      try {
        const newThesis = new Thesis({
          title,
          author,
          description,
          filePath,
          keywords
        });

        await newThesis.save();
        res.json({ message: 'Thesis uploaded & keywords extracted!', thesis: newThesis });

      } catch (err) {
        res.status(500).json({ message: 'Upload failed', error: err });
      }
    });
  });
});
// Get All Theses
app.get('/api/theses', async (req, res) => {
  const { search } = req.query;

  let filter = {};
  if (search) {
    filter = {
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { keywords: { $regex: search, $options: 'i' } }
      ]
    };
  }

  try {
    const theses = await Thesis.find(filter).sort({ uploadedAt: -1 });
    res.json(theses);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch theses', error: err });
  }
});

app.put('/api/thesis/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const thesis = await Thesis.findByIdAndUpdate(
      id,
      { status: status },
      { new: true }
    );
    res.json({ message: 'Status updated', thesis });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update status', error: err });
  }
});

app.delete('/api/thesis/:id', async (req, res) => {
  try {
    const thesis = await Thesis.findById(req.params.id);
    if (!thesis) return res.status(404).json({ message: 'Not found' });

    fs.unlinkSync(thesis.filePath); // Local file remove
    await thesis.remove();

    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed', error: err });
  }
});


// Start Server
app.listen(5000, () => console.log(`Server running on http://localhost:5000`));