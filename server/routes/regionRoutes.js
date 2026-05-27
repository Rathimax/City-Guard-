import express from 'express';
import Region from '../models/Region.js';

const router = express.Router();

const DEFAULT_REGIONS = [
  'Downtown',
  'Brooklyn',
  'Greenwood Society',
  'Sunrise Apartments',
  'CU'
];

// @route   GET /api/regions
// @desc    Get all available regions (seeds default regions if empty)
router.get('/', async (req, res) => {
  try {
    let regions = await Region.find().sort({ name: 1 });

    if (regions.length === 0) {
      console.log('Seeding default regions...');
      const seedData = DEFAULT_REGIONS.map(name => ({ name }));
      regions = await Region.insertMany(seedData);
    }

    res.json(regions);
  } catch (error) {
    console.error('Error fetching regions:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/regions
// @desc    Add a new region
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Region name is required' });
    }

    const existingRegion = await Region.findOne({ name });
    if (existingRegion) {
      return res.status(400).json({ message: 'Region already exists' });
    }

    const newRegion = new Region({ name });
    const savedRegion = await newRegion.save();
    
    res.status(201).json(savedRegion);
  } catch (error) {
    console.error('Error adding region:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
