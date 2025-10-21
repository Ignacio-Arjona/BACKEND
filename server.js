const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
});
const User = mongoose.model('User', UserSchema);

app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  const user = new User({ username, password });
  await user.save();
  res.send('User saved!');
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username, password });
  if (user) {
    res.send('Login successful!');
  } else {
    res.status(401).send('Invalid credentials');
  }
});

app.delete('/delete', async (req, res) => {
  const { username, password } = req.body;
  const result = await User.deleteOne({ username, password });
  if (result.deletedCount > 0) {
    res.send('Account deleted');
  } else {
    res.status(404).send('User not found');
  }
});

app.put('/change-password', async (req, res) => {
  const { username, oldPassword, newPassword } = req.body;
  const user = await User.findOne({ username, password: oldPassword });
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
