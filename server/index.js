import express from 'express';
import pg from 'pg';
import cors from 'cors';
import bcrypt from 'bcrypt';
import path from 'path';

const app = express();
const port = process.env.PORT || 5000;

// Middleware to parse JSON and handle CORS
app.use(express.json());
app.use(cors());

// PostgreSQL client setup
const db = new pg.Client({
  user: 'postgres',
  host: 'localhost',
  database: 'Inventory',
  password: 'rushikeshwayal@007',
  port: 5432,
});

// Connect to PostgreSQL
db.connect((err) => {
  if (err) {
    console.error('Failed to connect to the database:', err);
  } else {
    console.log('Connected to the PostgreSQL database');
  }
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../client/build')));

// Define API route to fetch items
app.get('/api/items', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM items');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Define API route to fetch users
app.get('/api/users', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Register route
app.post('/api/register', async (req, res) => {
  const { name, email, password, department } = req.body;

  try {
    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      'INSERT INTO users (name, email, password, department) VALUES ($1, $2, $3, $4)',
      [name, email, hashedPassword, department]
    );

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Login route
app.post('/api/login', async (req, res) => {
  const { email, password, department } = req.body;

  try {
    // Fetch user from the database
    const result = await db.query('SELECT * FROM users WHERE email = $1 AND department = $2', [email, department]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or department' });
    }

    // Compare the hashed password
    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      res.status(200).json({ message: 'Login successful' });
    } else {
      res.status(401).json({ message: 'Invalid password' });
    }
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({ message: 'Login failed' });
  }
});

// The "catchall" handler: for any request that doesn't match one above, send back the React index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
