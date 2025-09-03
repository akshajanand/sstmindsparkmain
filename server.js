import express from 'express';
import session from 'express-session';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
  secret: 'sst-secret',
  resave: false,
  saveUninitialized: false
}));

// Register
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const password_hash = await bcrypt.hash(password, 10);

  const { error } = await supabase
    .from('users')
    .insert([{ username, password_hash }]);

  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'User registered' });
});

// Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .limit(1);

  if (error || users.length === 0) return res.status(400).json({ error: 'Invalid credentials' });

  const user = users[0];
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) return res.status(400).json({ error: 'Invalid credentials' });

  req.session.user = { id: user.id, username: user.username };
  res.json({ message: 'Login successful' });
});

// Example protected route
app.get('/questions', async (req, res) => {
  if (!req.session.user) return res.status(403).json({ error: 'Unauthorized' });

  const { data, error } = await supabase.from('questions').select('*');
  if (error) return res.status(400).json({ error: error.message });

  res.json(data);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});