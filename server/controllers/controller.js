const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userSchema = require('../schemas/userSchema');
const resSend = require('../plugins/resSend');
const topicsSchema = require('../schemas/topicsSchema');
const mongoose = require('mongoose');
const user = require('../schemas/userSchema');
const Chat = require('../schemas/chatSchema');

exports.login = async (req, res) => {
  const { username, password1 } = req.body;
  try {
    const existingUser = await userSchema.findOne({ username });
    const role = existingUser.role;
    const profileImage = existingUser.profileImage;
    const id = existingUser._id;
    if (!existingUser) {
      return resSend(res, false, null, 'Incorrect login data');
    }

    const isPasswordMatch = await bcrypt.compare(
      password1,
      existingUser.password
    );
    if (isPasswordMatch) {
      const token = jwt.sign(
        { username: existingUser.username },
        process.env.JWT_SECRET,
        {
          expiresIn: '876000h',
        }
      );

      return resSend(
        res,
        true,
        { token, id, username, role, profileImage },
        'Login successful.'
      );
    } else {
      return resSend(res, false, null, 'Incorrect login data');
    }
  } catch (error) {
    console.log('Login error:', error);
    return resSend(res, false, null, 'Login error.');
  }
};

exports.register = async (req, res) => {
  const { username, password1, role } = req.body;
  try {
    const existingUser = await userSchema.findOne({ username });
    if (existingUser) {
      return resSend(res, false, null, 'Username already taken');
    }
    const hashedPassword = await bcrypt.hash(password1, 10);
    const newUser = new userSchema({
      username,
      password: hashedPassword,
      role: role,
      profileImage:
        'https://t4.ftcdn.net/jpg/00/64/67/63/360_F_64676383_LdbmhiNM6Ypzb3FM4PPuFP9rHe7ri8Ju.jpg',
    });
    await newUser.save();

    resSend(res, true, null, 'Registration successful');
  } catch (error) {
    console.log(error);
    resSend(res, false, null, 'Internal server error');
  }
};

exports.autoLogin = async (req, res) => {
  const { token } = req.body;
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  const { username } = decodedToken;
  const existingUser = await userSchema.findOne({ username });
  try {
    res.status(200).json({
      message: 'success',
      id: existingUser._id,
      username: username,
      role: existingUser.role,
      profileImage: existingUser.profileImage,
    });
  } catch {
    res.status(500).json({ message: 'Error' });
  }
};
exports.getTopics = async (req, res) => {
  const topics = await topicsSchema.find();
  resSend(res, true, topics, 'Get topics successful');
};
exports.getDiscussions = async (req, res) => {
  const topic = req.params.topic;
  const discussions = await topicsSchema.find({ TopicName: topic });
  resSend(res, true, discussions, 'Get discussions successful');
};
exports.getDiscussionsFromToken = async (req, res) => {
  const token = req.params.token;
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  const { username } = decodedToken;
  const existingUser = await userSchema.findOne({ username });
  if (!existingUser) {
    return resSend(res, false, null, 'User not found');
  }
  const discussions = await topicsSchema.find({
    'Discussions.UserID': existingUser._id,
  });
  const discussionsArray = [].concat(
    ...discussions.map((topic) => topic.Discussions)
  );
  const filteredDiscussions = discussionsArray.filter(
    (discussion) => discussion.UserID === existingUser._id.toString()
  );
  resSend(res, true, filteredDiscussions, 'Get discussions successful');
};
exports.getDiscussionById = async (req, res) => {
  const discussionId = req.params.discussionId;

  try {
    const discussionArray = await topicsSchema.findOne({
      'Discussions._id': new mongoose.Types.ObjectId(discussionId),
    });

    if (discussionArray && discussionArray.Discussions) {
      const discussion = discussionArray.Discussions.find(
        (discussion) => discussion._id.toString() === discussionId
      );

      if (discussion) {
        const user = await userSchema.findOne({ _id: discussion.UserID });

        if (user) {
          const currentDiscussion = {
            Title: discussion.Title,
            Description: discussion.Description,
            UserID: discussion.UserID,
            _id: discussionId,
            username: user.username,
            profileImage: user.profileImage,
          };

          return resSend(
            res,
            true,
            currentDiscussion,
            'Get discussion successful'
          );
        } else {
          return resSend(res, false, null, 'User not found for discussion');
        }
      } else {
        return resSend(res, false, null, 'Discussion not found');
      }
    } else {
      return resSend(res, false, null, 'No discussions found');
    }
  } catch (error) {
    console.error(error);
    return resSend(res, false, null, 'Error fetching discussion');
  }
};
exports.getAnswers = async (req, res) => {
  const discussionId = req.params.discussionId;
  try {
    const foundTopic = await topicsSchema.findOne({
      'Discussions._id': new mongoose.Types.ObjectId(discussionId),
    });
    const discussionIndex = foundTopic.Discussions.findIndex(
      (discussion) => discussion._id.toString() === discussionId
    );
    const userIds = foundTopic.Discussions[discussionIndex].Answers.map(
      (answer) => answer.UserID
    );
    const users = await userSchema.find({ _id: { $in: userIds } });
    const userIdToUsernameMap = {};
    users.forEach((user) => {
      userIdToUsernameMap[user._id.toString()] = user.username;
    });
    const modifiedAnswers = foundTopic.Discussions[discussionIndex].Answers.map(
      (answer) => {
        const userIdAsString = String(answer.UserID);
        const username = userIdToUsernameMap[userIdAsString];
        return {
          Username: username,
          UserID: answer.UserID,
          Content: answer.Content,
          CreatedAt: answer.CreatedAt,
          _id: answer._id,
        };
      }
    );

    res.send({
      success: true,
      data: modifiedAnswers,
      message: 'Get discussions successful',
    });
  } catch (error) {
    console.error(error);
    res.send({
      success: false,
      data: null,
      message: 'Error fetching discussions',
    });
  }
};
exports.getAnswersFromToken = async (req, res) => {
  const token = req.params.token;
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  const { username } = decodedToken;
  const existingUser = await userSchema.findOne({ username });
  if (!existingUser) {
    return resSend(res, false, null, 'User not found');
  }
  const answers = await topicsSchema.find({
    'Discussions.Answers.UserID': existingUser._id,
  });

  const answersArray = [].concat(
    ...answers.map((topic) =>
      [].concat(...topic.Discussions.map((discussion) => discussion.Answers))
    )
  );
  const filteredAnswers = answersArray.filter(
    (answer) => answer.UserID === existingUser._id.toString()
  );
  resSend(res, true, filteredAnswers, 'Get discussions successful');
};

exports.changeProfilePicture = async (req, res) => {
  const { token, newProfileImage } = req.body;
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const { username } = decodedToken;
    const existingUser = await userSchema.findOne({ username });
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    existingUser.profileImage = newProfileImage;
    await existingUser.save();
    res.status(200).json({
      success: true,
      message: 'Image updated successfully',
      username: username,
      role: existingUser.role,
      profileImage: existingUser.profileImage,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating profile picture' });
  }
};
exports.createTopic = async (req, res) => {
  try {
    const { topicName, token } = req.body;
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const { username } = decodedToken;
    const existingUser = await userSchema.findOne({ username });
    if (existingUser.role !== 'admin') {
      return resSend(res, false, null, 'Only admins can create topics');
    }
    const newTopic = new topicsSchema({
      TopicName: topicName.toLowerCase(),
    });
    await newTopic.save();
    resSend(res, true, null, 'Topic created successfully');
  } catch (error) {
    console.log(error);
    resSend(res, false, null, 'Internal server error');
  }
};
exports.createDiscussion = async (req, res) => {
  try {
    const { topicName, discussionTitle, discussionDescription, token } =
      req.body;
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const { username } = decodedToken;
    const existingUser = await userSchema.findOne({ username });
    if (!existingUser) {
      return resSend(res, false, null, 'User not found');
    }
    const topic = await topicsSchema.findOne({
      TopicName: topicName.toLowerCase(),
    });
    if (!topic) {
      return resSend(res, false, null, 'Topic not found');
    }

    const newDiscussion = {
      Title: discussionTitle,
      Description: discussionDescription,
      CreatedAt: new Date(),
      Answers: [],
      UserID: existingUser._id,
    };
    topic.Discussions.push(newDiscussion);
    await topic.save();
    resSend(res, true, null, 'Discussion created successfully');
  } catch (error) {
    console.log(error);
    resSend(res, false, null, 'Internal server error');
  }
};
exports.createAnswer = async (req, res) => {
  try {
    const { topic, discussionId, answer, token } = req.body;
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const { username } = decodedToken;
    const existingUser = await userSchema.findOne({ username });
    if (!existingUser) {
      return resSend(res, false, null, 'User not found');
    }
    if (!mongoose.Types.ObjectId.isValid(discussionId)) {
      return resSend(res, false, null, 'Invalid discussionId');
    }
    const foundTopic = await topicsSchema.findOne({
      TopicName: topic.toLowerCase(),
      'Discussions._id': new mongoose.Types.ObjectId(discussionId),
    });
    if (!foundTopic) {
      return resSend(res, false, null, 'Topic or discussion not found');
    }
    const discussionIndex = foundTopic.Discussions.findIndex(
      (d) => d._id.toString() === discussionId
    );
    if (discussionIndex !== -1) {
      const newAnswer = {
        UserID: existingUser._id,
        Content: answer,
        CreatedAt: new Date(),
      };
      foundTopic.Discussions[discussionIndex].Answers.push(newAnswer);
      await foundTopic.save();
      return resSend(res, true, null, 'Answer posted successfully');
    } else {
      return resSend(res, false, null, 'Discussion not found');
    }
  } catch (error) {
    console.log(error);
    return resSend(res, false, null, 'Internal server error');
  }
};

exports.sendChat = async (req, res) => {
  const { sender, receiver, content } = req.body;
  const decodedToken = jwt.verify(sender, process.env.JWT_SECRET);
  const { username } = decodedToken;
  const existingUser = await userSchema.findOne({ username });
  if (!existingUser) {
    return resSend(res, false, null, 'User not found');
  }
  try {
    const senderId = existingUser._id;
    const newChat = new Chat({ sender: senderId, receiver, content });
    await newChat.save();
    resSend(res, true, null, 'Message sent successfully');
  } catch (error) {
    console.error(error);
    resSend(res, false, null, 'Error sending message');
  }
};

exports.getUserChats = async (req, res) => {
  const token = req.params.token;
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const { username } = decodedToken;

    const existingUser = await userSchema.findOne({ username });

    if (!existingUser) {
      return resSend(res, false, null, 'User not found');
    }

    const { _id: user } = existingUser;

    const chatHistory = await Chat.find({
      $or: [{ receiver: user }, { sender: user }],
    }).sort({ timestamp: 1 });

    // Calculate unread message count for each chat user
    const unreadMessageCounts = {};
    chatHistory.forEach((message) => {
      const otherUserId =
        message.sender.toString() === user.toString()
          ? message.receiver
          : message.sender;
      if (
        !message.read &&
        otherUserId === message.sender &&
        otherUserId !== user.toString()
      ) {
        unreadMessageCounts[otherUserId] =
          (unreadMessageCounts[otherUserId] || 0) + 1;
      }
    });

    // Extract unique values from "sender" and "receiver" fields
    const uniqueSenders = [
      ...new Set(chatHistory.map((message) => message.sender)),
    ];
    const uniqueReceivers = [
      ...new Set(chatHistory.map((message) => message.receiver)),
    ];

    // Combine unique values from "sender" and "receiver" fields
    const uniqueUsers = [...new Set([...uniqueSenders, ...uniqueReceivers])];
    const chatUsers = await userSchema
      .find({ _id: { $in: uniqueUsers } })
      .select('-password -role');

    // Add unreadMessageCount to each chat user
    const usersWithUnreadCount = chatUsers.map((chatUser) => ({
      ...chatUser.toObject(),
      unreadMessageCount: unreadMessageCounts[chatUser._id] || 0,
    }));

    resSend(
      res,
      true,
      usersWithUnreadCount,
      'Chat history retrieved successfully'
    );
  } catch (error) {
    console.error(error);
    resSend(res, false, null, 'Error retrieving chat history');
  }
};

exports.getChat = async (req, res) => {
  const { token, receiver } = req.params;

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const { username } = decodedToken;

    const existingUser = await userSchema.findOne({ username });

    if (!existingUser) {
      return resSend(res, false, null, 'User not found');
    }

    const sender = existingUser._id;
    const chatHistory = await Chat.find({
      $or: [
        { sender, receiver },
        { sender: receiver, receiver: sender },
      ],
    }).sort({ timestamp: 1 });

    chatHistory.forEach(async (message) => {
      if (
        message.receiver.toString() === sender.toString() &&
        message.sender.toString() === receiver &&
        !message.read
      ) {
        message.read = true;
        await message.save();
      }
    });
    resSend(res, true, chatHistory, 'Chat history retrieved successfully');
  } catch (error) {
    console.error(error);
    resSend(res, false, null, 'Error retrieving chat history');
  }
};
