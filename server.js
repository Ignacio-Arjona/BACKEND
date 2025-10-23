const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // ✅ Added CORS

const app = express();
app.use(cors()); // ✅ Enable CORS
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String,
});

const User = mongoose.model('User', UserSchema);

app.post('/signup', async (req, res) => {
  const { email, username, password } = req.body;

  // Verificar si el correo ya existe
  const existingEmail = await User.findOne({ email })
  if (existingEmail) {
    return res.status(410).send('Este correo electrónico ya está asociado a una cuenta.')
  }

  // Verificar si el usuario ya existe
  const existingUser = await User.findOne({ username });
  if (existingUser) {
    return res.status(409).send('Este nombre de usuario ya está asociado a una cuenta.');
  }

  // Crear y guardar el nuevo usuario
  const user = new User({ email, username, password});
  await user.save();
  res.send('¡Usuario guardado!');
});



app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Buscar por username o email
  const user = await User.findOne({
    $or: [{ username }, { email: username }],
    password
  });

  if (user) {
    res.send('Login successful!');
  } else {
    res.status(401).send('Los datos introducidos no son correctos. Inténtalo de nuevo.﻿');
  }
});

app.delete('/delete', async (req, res) => {
  const { username, password } = req.body;

  // Buscar y eliminar por username o email
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

  // Buscar por username o email
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

app.listen(3000, () => console.log('Server running on port 3000'));