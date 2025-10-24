const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase limit for base64 images

// ✅ Connect to User Database
const userDB = mongoose.createConnection(process.env.MONGO_URI);
userDB.on('connected', () => console.log('Connected to User Database (MONGO_URI)'));
userDB.on('error', (err) => console.error('User DB connection error:', err));

// ✅ Connect to Book Database
const bookDB = mongoose.createConnection(process.env.MONGO_BOOK);
bookDB.on('connected', () => console.log('Connected to Book Database (MONGO_BOOK)'));
bookDB.on('error', (err) => console.error('Book DB connection error:', err));

// User Schema (connected to MONGO_URI)
const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String,
});
const User = userDB.model('User', UserSchema);

// ✅ Book Schema (connected to MONGO_BOOK)
const BookSchema = new mongoose.Schema({
  bookName: String,
  bookAuthor: String,
  bookDescription: String,
  bookImage: String, // base64 encoded image
  createdAt: { type: Date, default: Date.now }
});
const Book = bookDB.model('Book', BookSchema);

app.get('/wakeup', (req, res) => res.send('OK'));

// User routes (existing - using MONGO_URI)
app.post('/signup', async (req, res) => {
  const { email, username, password } = req.body;
  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    return res.status(410).send('Este correo electrónico ya está asociado a una cuenta.');
  }
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res.status(409).send('Este nombre de usuario ya está asociado a una cuenta.');
  }
  const user = new User({ email, username, password });
  await user.save();
  res.send('¡Usuario Guardado!');
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({
    $or: [{ username }, { email: username }],
    password
  });
  if (user) {
    res.send('¡Sesión Iniciada!');
  } else {
    res.status(401).send('Los datos introducidos no son correctos. Inténtalo de nuevo.');
  }
});

app.delete('/delete', async (req, res) => {
  const { username, password } = req.body;
  const result = await User.deleteOne({
    $or: [{ username }, { email: username }],
    password
  });
  if (result.deletedCount > 0) {
    res.send('Account deleted');
  } else {
    res.status(404).send('User not found');
  }
});

app.put('/change-password', async (req, res) => {
  const { username, oldPassword, newPassword } = req.body;
  const user = await User.findOne({
    $or: [{ username }, { email: username }],
    password: oldPassword
  });
  if (user) {
    user.password = newPassword;
    await user.save();
    res.send('Password updated');
  } else {
    res.status(401).send('Invalid credentials');
  }
});

app.post('/logout', (req, res) => {
  res.send('Logged out');
});

// ✅ Book route (using MONGO_BOOK)
app.post('/save-book', async (req, res) => {
  try {
    const { bookName, bookAuthor, bookDescription, bookImage } = req.body;
    
    if (!bookName || !bookAuthor || !bookDescription || !bookImage) {
      return res.status(400).send('Todos los campos son obligatorios');
    }

    const book = new Book({ bookName, bookAuthor, bookDescription, bookImage });
    await book.save();
    res.send('¡Libro guardado exitosamente!');
  } catch (error) {
    console.error('Error saving book:', error);
    res.status(500).send('Error al guardar el libro');
  }
});

app.get('/get-books', async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 }); // Most recent first
    res.json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: 'Error al obtener los libros' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
