const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

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
    req.session.user = username;
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
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send('Logout failed');
    }
    res.clearCookie('connect.sid');
    res.send('Logged out');
  });
});

function isAuthenticated(req, res, next) {
  if (req.session.user) {
    next();
  } else {
    res.status(403).send('Not authenticated');
  }
}

app.get('/status', (req, res) => {
  if (req.session.user) {
    res.send(`Logged in as ${req.session.user}`);
  } else {
    res.send('Not logged in');
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));
``