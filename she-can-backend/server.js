import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

// Securely pulling credentials from your hidden .env file
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Securely via .env'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// ---- SCHEMAS & MODELS ----

// Message Schema (For Contact Form)
const MessageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', MessageSchema);

// User Schema (Now handles both User and Admin accounts)
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, default: 'user' } // 'user' or 'admin'
});
const User = mongoose.model('User', UserSchema);

// ---- AUTH MIDDLEWARE ----
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: "Access denied. Token missing." });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token." });
    req.user = user;
    next();
  });
};

// ---- ROUTE APIs ----

// Public API: Submit Form Message
app.post('/api/messages', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ error: "All fields are required" });

    const newMessage = new Message({ name, email, message });
    await newMessage.save();
    res.status(201).json({ message: "Form Submitted Successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Auth API: Signup Route (Accepts custom roles)
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, role } = req.body; // Expecting 'user' or 'admin'
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

    const targetRole = role === 'admin' ? 'admin' : 'user';

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "An account already exists with this email" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ email, password: hashedPassword, role: targetRole });
    await newUser.save();

    res.status(201).json({ message: `${targetRole.toUpperCase()} Account Created Successfully` });
  } catch (error) {
    res.status(500).json({ error: "Failed to create account" });
  }
});

// Auth API: Login Route
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid email or password" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: "Invalid email or password" });

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    
    // Return token along with the user's role to the frontend
    res.status(200).json({ token, role: user.role, message: "Logged in successfully" });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});

// Protected API: View Messages (Admin validation gate check)
app.get('/api/messages', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Forbidden. Access restricted to Admins only." });
    }
    const allMessages = await Message.find().sort({ createdAt: -1 });
    res.status(200).json(allMessages);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve messages" });
  }
});

// Protected API: Delete a Contact Message (Admin Only)
app.delete('/api/messages/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Access restricted to Admins." });
    }
    
    await Message.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete message" });
  }
});

// Protected API: View All Registered Users/Admins (Admin Only)
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Access restricted to Admins." });
    }
    // Fetch all users but hide their hashed passwords for security
    const allUsers = await User.find({}, '-password');
    res.status(200).json(allUsers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Protected API: Delete a Registered User/Admin account (Admin Only)
app.delete('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: "Access restricted to Admins." });
    }
    
    // Optional: Prevent an admin from deleting themselves accidentally
    if (req.user.id === req.params.id) {
      return res.status(400).json({ error: "You cannot delete your own admin account while logged in." });
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "User account deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

