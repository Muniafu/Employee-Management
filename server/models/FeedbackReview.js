const mongoose = require('mongoose');

const feedbackReviewSchema = new mongoose.Schema({
  feedback_text: {
    type: String,
    required: true,
  },
  review_text: {
    type: String,
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('FeedbackReview', feedbackReviewSchema);
