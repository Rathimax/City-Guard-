import mongoose from 'mongoose';

const issueSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: false // Optional for backward compatibility, but we will send it from frontend
  },
  userName: {
    type: String,
    required: true,
    trim: true
  },
  issueDescription: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  photoUrl: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved'],
    default: 'Pending'
  },
  urgency: {
    type: String,
    enum: ['Normal', 'Urgent', 'Critical'],
    default: 'Normal'
  },
  assignedTo: {
    type: String,
    default: 'Not Assigned' // e.g., 'Public Works', 'Police', 'Sanitation'
  },
  mayorCommands: {
    type: String,
    default: ''
  },
  adminNotes: {
    type: String,
    default: ''
  },
  upvotes: {
    type: Number,
    default: 0
  },
  downvotes: {
    type: Number,
    default: 0
  },
  voteScore: {
    type: Number,
    default: 0
  },
  voters: [{
    userId: String,
    voteType: {
      type: String,
      enum: ['up', 'down']
    }
  }],
  isAnonymous: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for geospatial queries
issueSchema.index({ location: '2dsphere' });

const Issue = mongoose.model('Issue', issueSchema);

export default Issue;
