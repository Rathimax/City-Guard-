import express from 'express';
import User from '../models/User.js';
import Region from '../models/Region.js';

const router = express.Router();

// @route   POST /api/users/sync
// @desc    Sync Firebase user with MongoDB (create if doesn't exist, return if exists)
router.post('/sync', async (req, res) => {
  try {
    const { firebaseUid, email, region, role } = req.body;

    if (!firebaseUid || !email) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Try to find the user
    let user = await User.findOne({ firebaseUid });

    // Auto-promote mayor emails for security and ease of testing
    const isMayorEmail = ['mayor@cityguard.com', 'rathiabhayraj@gmail.com'].includes(email.toLowerCase());
    const determinedRole = isMayorEmail ? 'mayor' : (role || 'citizen');

    if (!user) {
      // Create new user (this happens on first login/signup, or if the MongoDB was reset)
      let userRegion = region;
      if (!userRegion) {
        // Fallback: find the first region in MongoDB, or default to 'CU'
        const defaultRegion = await Region.findOne({});
        userRegion = defaultRegion ? defaultRegion.name : 'CU';
      }
      
      user = new User({
        firebaseUid,
        email,
        region: userRegion,
        role: determinedRole
      });
      await user.save();
    } else if (isMayorEmail && user.role !== 'mayor') {
      // Ensure existing user gets promoted if synced
      user.role = 'mayor';
      await user.save();
    }

    res.json(user);
  } catch (error) {
    console.error('User sync error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PATCH /api/users/region
// @desc    Update a user's region
router.patch('/region', async (req, res) => {
  try {
    const { firebaseUid, region } = req.body;
    
    if (!firebaseUid || !region) {
      return res.status(400).json({ message: 'Missing firebaseUid or region' });
    }

    const updatedUser = await User.findOneAndUpdate(
      { firebaseUid },
      { region },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Region update error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
