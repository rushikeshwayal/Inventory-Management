import express from 'express';
import { Client } from 'pg';

const router = express.Router();

// PostgreSQL client setup
const db = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'Inventory',
  password: 'rushikeshwayal@007',
  port: 5432,
});

db.connect();

// Route to get space usage information
router.get('/warehouse-space', async (req, res) => {
  try {
    // Get total storage space (e.g., in square meters or cubic meters)
    const totalSpace = 1000;  // Set this to your fixed storage space

    // Get products and their space usage
    const result = await db.query(`
      SELECT item_name, space_occupied
      FROM healthcare
    `);

    const products = result.rows;

    // Calculate total occupied space
    const occupiedSpace = products.reduce((total, product) => total + parseFloat(product.space_occupied), 0);

    // Calculate remaining space
    const remainingSpace = totalSpace - occupiedSpace;

    res.json({
      totalSpace,
      occupiedSpace,
      remainingSpace,
      products
    });
  } catch (error) {
    console.error('Error retrieving warehouse space information:', error);
    res.status(500).json({ message: 'Failed to retrieve warehouse space information' });
  }
});

export default router;
