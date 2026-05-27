import express from 'express';
import multer from 'multer';
import Issue from '../models/Issue.js';
import { cloudinary } from '../config/cloudinary.js';

const router = express.Router();

// Use memory storage so we can manually upload each file to Cloudinary
// with the correct resource_type (image vs video/audio)
const upload = multer({ storage: multer.memoryStorage() });

const combinedUpload = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'audio', maxCount: 1 },
]);

// Helper: upload a buffer to Cloudinary
const uploadToCloudinary = (fileBuffer, options) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
    stream.end(fileBuffer);
  });
};

// @route   POST /api/issues
// @desc    Create a new issue with image and optional audio upload
router.post('/', combinedUpload, async (req, res) => {
  try {
    const { userId, userName, issueDescription, latitude, longitude, urgency, isAnonymous, region } = req.body;

    if (!region) {
      return res.status(400).json({ message: 'Region is required' });
    }

    // Validate image upload
    if (!req.files?.image?.[0]) {
      return res.status(400).json({ message: 'Please upload an image' });
    }

    // Upload image to Cloudinary
    const imageFile = req.files.image[0];
    const imageResult = await uploadToCloudinary(imageFile.buffer, {
      folder: 'smart-city-issues',
      resource_type: 'image',
    });

    let audioUrl = null;

    // If audio file was uploaded, upload it to Cloudinary as video/audio resource
    if (req.files?.audio?.[0]) {
      try {
        const audioFile = req.files.audio[0];
        const audioResult = await uploadToCloudinary(audioFile.buffer, {
          folder: 'smart-city-audio',
          resource_type: 'video', // Cloudinary uses 'video' for audio files
        });
        audioUrl = audioResult.secure_url;
      } catch (audioErr) {
        console.warn('Audio upload to Cloudinary failed, proceeding without audio:', audioErr.message);
      }
    }

    const newIssue = new Issue({
      userId,
      userName,
      isAnonymous: isAnonymous === 'true' || isAnonymous === true,
      issueDescription,
      urgency,
      region,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)]
      },
      photoUrl: imageResult.secure_url,
      audioUrl,
    });

    const savedIssue = await newIssue.save();
    res.status(201).json(savedIssue);
  } catch (error) {
    console.error('Error creating issue:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/issues
// @desc    Get all issues, optionally filtered by region
router.get('/', async (req, res) => {
  try {
    const { region } = req.query;
    const filter = region ? { region } : {};
    
    const issues = await Issue.find(filter).sort({ voteScore: -1, createdAt: -1 });
    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PATCH /api/issues/:id/status
// @desc    Update issue management details (status, assignment, commands)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, assignedTo, mayorCommands, adminNotes } = req.body;
    
    // Create an update object with only provided fields
    const updateData = {};
    if (status) updateData.status = status;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo;
    if (mayorCommands !== undefined) updateData.mayorCommands = mayorCommands;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

    const updatedIssue = await Issue.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    res.json(updatedIssue);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PATCH /api/issues/:id/vote
// @desc    Vote on an issue (up/down) with per-user tracking
router.patch('/:id/vote', async (req, res) => {
  try {
    const { userId, type } = req.body;
    if (!userId || !['up', 'down'].includes(type)) {
      return res.status(400).json({ message: 'Missing userId or invalid vote type' });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    const voterIndex = issue.voters.findIndex(v => v.userId === userId);
    const existingVote = voterIndex !== -1 ? issue.voters[voterIndex].voteType : null;

    if (existingVote === type) {
      // Toggle off: removing existing vote
      issue.voters.splice(voterIndex, 1);
    } else if (existingVote) {
      // Change vote: user clicked the opposite button
      issue.voters[voterIndex].voteType = type;
    } else {
      // New vote
      issue.voters.push({ userId, voteType: type });
    }

    // Recalculate totals
    issue.upvotes = issue.voters.filter(v => v.voteType === 'up').length;
    issue.downvotes = issue.voters.filter(v => v.voteType === 'down').length;
    issue.voteScore = issue.upvotes - issue.downvotes;

    const savedIssue = await issue.save();
    res.json(savedIssue);
  } catch (error) {
    console.error('Voting error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/issues/:id/comments
// @desc    Add a comment to an issue
router.post('/:id/comments', async (req, res) => {
  try {
    const { userId, userName, text, isAnonymous } = req.body;
    if (!userId || !userName || !text) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    const newComment = {
      userId,
      userName: isAnonymous ? 'Anonymous' : userName,
      text,
      isAnonymous: isAnonymous === true || isAnonymous === 'true'
    };

    issue.comments.push(newComment);
    const savedIssue = await issue.save();
    res.status(201).json(savedIssue);
  } catch (error) {
    console.error('Comment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/issues/:id/comments/:commentId
// @desc    Delete a comment
router.delete('/:id/comments/:commentId', async (req, res) => {
  try {
    const { userId } = req.body; // Need userId to verify ownership
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    const commentIndex = issue.comments.findIndex(c => c._id.toString() === req.params.commentId);
    if (commentIndex === -1) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (issue.comments[commentIndex].userId !== userId) {
      return res.status(403).json({ message: 'Unauthorized to delete this comment' });
    }

    issue.comments.splice(commentIndex, 1);
    const savedIssue = await issue.save();
    res.json(savedIssue);
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
