const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const forumSchema = new Schema({
  TopicName: {
    type: String,
    required: true,
    unique: true,
  },
  Discussions: [
    {
      Title: {
        type: String,
        required: true,
      },
      Description: {
        type: String,
        required: true,
      },
      CreatedAt: {
        type: Date,
        default: Date.now,
      },
      UserID: {
        type: String,
        ref: 'user',
        required: true,
      },
      Answers: [
        {
          UserID: {
            type: String,
            ref: 'user',
            required: true,
          },
          Content: {
            type: String,
            required: true,
          },
          CreatedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },
  ],
});

const forum = mongoose.model('forum', forumSchema);
module.exports = forum;
