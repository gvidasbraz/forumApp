const express = require('express');
const router = express.Router();
const controller = require('../controllers/controller');
const middleware = require('../middleware/middleware');

router.post('/login', controller.login);
router.post(
  '/register',
  middleware.validUsername,
  middleware.validPassword,
  controller.register
);
router.post('/autoLogin', middleware.validToken, controller.autoLogin);
router.post(
  '/changeProfilePicture',
  middleware.validToken,
  middleware.validImageUrl,
  controller.changeProfilePicture
);
router.get('/topics', controller.getTopics);
router.get('/discussions/:topic', controller.getDiscussions);
router.get('/discussions/id/:discussionId', controller.getDiscussionById);
router.get('/discussions/token/:token', controller.getDiscussionsFromToken);
router.get('/answers/:discussionId', controller.getAnswers);
router.get('/answers/token/:token', controller.getAnswersFromToken);
router.post('/createTopic', middleware.validToken, controller.createTopic);
router.post(
  '/createDiscussion',
  middleware.validToken,
  controller.createDiscussion
);
router.post('/createAnswer', middleware.validToken, controller.createAnswer);

router.post('/sendChat', middleware.validToken, controller.sendChat);
router.get('/getUserChats/:token', controller.getUserChats);
router.get('/getChat/:token/:receiver', controller.getChat);

module.exports = router;
