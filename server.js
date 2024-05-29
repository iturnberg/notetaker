const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Path to the JSON file that stores the notes
const notesFilePath = path.join(__dirname, 'db', 'notes.json');

// Helper function to read notes from the file
const readNotes = () => {
  const data = fs.readFileSync(notesFilePath, 'utf8');
  return JSON.parse(data);
};

// Helper function to write notes to the file
const writeNotes = (notes) => {
  fs.writeFileSync(notesFilePath, JSON.stringify(notes, null, 2));
};

// GET /api/notes - Retrieve all notes
app.get('/api/notes', (req, res) => {
  try {
    const notes = readNotes();
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read notes' });
  }
});

// POST /api/notes - Save a new note
app.post('/api/notes', (req, res) => {
  try {
    const notes = readNotes();
    const newNote = { id: Date.now(), ...req.body };
    notes.push(newNote);
    writeNotes(notes);
    res.json(newNote);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save note' });
  }
});

// DELETE /api/notes/:id - Delete a note by id
app.delete('/api/notes/:id', (req, res) => {
  try {
    const notes = readNotes();
    const noteId = parseInt(req.params.id, 10);
    const updatedNotes = notes.filter(note => note.id !== noteId);
    writeNotes(updatedNotes);
    res.json({ message: 'Note deleted', id: noteId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// Serve the index.html file for non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
