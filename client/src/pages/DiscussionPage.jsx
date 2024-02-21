import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import http from '../plugins/http';
import { useStore } from '../store/myStore';
import MessageModal from '../components/MessageModal';

function DiscussionPage() {
  const [answers, setAnswers] = useState([]);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [discussion, setDiscussion] = useState();
  const [selectedUserID, setSelectedUserID] = useState(null);
  const { user } = useStore();
  const { discussionId, topicName } = useParams();
  const answerRef = useRef();

  useEffect(() => {
    getAnswersByDiscussionId(discussionId);
    getDiscussionById(discussionId);
  }, [discussionId]);

  const getDiscussionById = async (discussionId) => {
    try {
      const response = await http.get(`discussions/id/${discussionId}`);
      setDiscussion(response.data);
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching answers:', error);
    }
  };
  const getAnswersByDiscussionId = async () => {
    try {
      const response = await http.get(`answers/${discussionId}`);
      setAnswers(response.data);
    } catch (error) {
      console.error('Error fetching answers:', error);
    }
  };
  const handleAnswerPost = async () => {
    const token = localStorage.getItem('token');
    const answerContent = answerRef.current.value;

    try {
      const response = await http.post('createAnswer', {
        topic: topicName,
        discussionId: discussionId,
        answer: answerContent,
        token: token,
      });

      if (response.success) {
        console.log(response);
        answerRef.current.value = '';
        getAnswersByDiscussionId(discussionId);
      } else {
        console.log(response);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSendMessage = (userID) => {
    setSelectedUserID(userID);
    setShowMessageModal(true);
  };

  const closeMessageModal = () => {
    setShowMessageModal(false);
    setSelectedUserID(null);
  };

  const isYouTubeLink = (link) => {
    return (
      link &&
      (link.includes('youtube.com') || link.includes('youtu.be')) &&
      link.includes('v=')
    );
  };

  const getYouTubeVideoId = (link) => {
    if (!link) {
      return null;
    }
    const url = new URL(link);
    if (url.hostname === 'youtu.be') {
      return url.pathname.substring(1);
    } else if (url.hostname === 'www.youtube.com') {
      return url.searchParams.get('v');
    } else {
      return null;
    }
  };

  return (
    <div>
      {discussion && (
        <div>
          <div className='post-owner'>
            <div className='post-owner-wrapper'>
              <img src={discussion.profileImage} alt='' />
              <div>{discussion.username}</div>
            </div>
            {user.id !== discussion.UserID && (
              <button onClick={() => handleSendMessage(discussion.UserID)}>
                Message {discussion.username}
              </button>
            )}
          </div>
          <div className='discussion-container'>
            <h3>{discussion.Title}</h3>
            <div className='discussion-description'>
              {discussion.Description}
            </div>
          </div>
        </div>
      )}

      <div className='answer-container'>
        <h3>Discussion:</h3>
        {answers &&
          answers.map((answer) => {
            const dateObject = new Date(answer.CreatedAt);
            const formattedDate = dateObject.toLocaleString('lt-LT');
            const linkParts = answer.Content.match(/\bhttps?:\/\/\S+/gi);
            let contentWithEmbeds = answer.Content;
            if (linkParts) {
              linkParts.forEach((link) => {
                if (isYouTubeLink(link)) {
                  const videoId = getYouTubeVideoId(link);
                  const embedCode = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
                  contentWithEmbeds = contentWithEmbeds.replace(
                    link,
                    embedCode
                  );
                }
              });
            }
            let nonLinkContent = answer.Content;

            if (linkParts) {
              linkParts.forEach((link) => {
                nonLinkContent = nonLinkContent.replace(link, `{{${link}}}`);
              });
            }
            const contentParts = contentWithEmbeds.split(
              /(<iframe[\s\S]*<\/iframe>)|(<a[\s\S]*<\/a>)|(\bhttps?:\/\/\S+\/?\b)|(\bwww\.\S+\/?\b)/
            );
            return (
              <div key={answer._id} className='answer'>
                <div className='info-and-button-wrapper'>
                  <div>
                    <h4>Answer by: {answer.Username}</h4>
                    <h5>{formattedDate}</h5>
                  </div>
                  <div className='private-message-button'>
                    {user.id !== answer.UserID && (
                      <button onClick={() => handleSendMessage(answer.UserID)}>
                        Message {answer.Username}
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  {contentParts.map((part, index) => {
                    if (part && part.startsWith('/ ')) {
                      part = part.substring(2);
                    }
                    if (part && part === '/') {
                      part = '';
                    }
                    if (
                      (part && part.startsWith('https://')) ||
                      (part && part.startsWith('http://'))
                    ) {
                      return <a href={part}>{part}</a>;
                    } else {
                      return (
                        <div
                          key={index}
                          dangerouslySetInnerHTML={{ __html: part }}
                        />
                      );
                    }
                  })}
                </div>
              </div>
            );
          })}
        {showMessageModal && (
          <MessageModal onClose={closeMessageModal} userID={selectedUserID} />
        )}
        <input type='text' placeholder='Your answer' ref={answerRef} />
        <button onClick={handleAnswerPost}>Post</button>
      </div>
    </div>
  );
}

export default DiscussionPage;
