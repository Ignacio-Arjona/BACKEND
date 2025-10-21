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
});

const User = mongoose.model('User', UserSchema);

app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  const user = new User({ username, password });
  await user.save();
  res.send('User saved!');
});

app.listen(3000, () => console.log('Server running on port 3000'));