import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useState } from 'react';
import http from '../plugins/http';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function TopicPage() {
  const [discussions, setDiscussions] = useState([]);
  const { topicName } = useParams();
  const [creatingDiscussion, setCreatingDiscussion] = useState(false);
  const discussionTitleRef = useRef();
  const discussionDescriptionRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    getDiscussionsByTopic(topicName);
  }, [topicName]);

  const getDiscussionsByTopic = async (topicName) => {
    try {
      const response = await http.get(`discussions/${topicName}`);
      console.log(response);
      setDiscussions(response.data[0].Discussions);
    } catch (error) {
      console.error('Error fetching discussions:', error);
    }
  };
  const handleCreateDiscussionButton = () => {
    setCreatingDiscussion(!creatingDiscussion);
  };

  const handleDiscussionCreate = async () => {
    const token = localStorage.getItem('token');
    const discussionTitle = discussionTitleRef.current.value;
    const discussionDescription = discussionDescriptionRef.current.value;
    try {
      const response = await http.post('createDiscussion', {
        topicName: topicName,
        discussionTitle: discussionTitle,
        discussionDescription: discussionDescription,
        token: token,
      });
      if (response.success) {
        console.log(response);
        discussionTitleRef.current.value = '';
        discussionDescriptionRef.current.value = '';
        setCreatingDiscussion(false);
        getDiscussionsByTopic(topicName);
      } else {
        console.log(response);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <div className='discussion-page-title'>
        {topicName.toUpperCase()} Discussion Page
        <div className='discussion-page-description'>All discussions:</div>
        {}
      </div>
      <div className='forum-posts-container'>
        {discussions &&
          discussions.map((discussion) => (
            <div
              className='forum-posts'
              key={discussion._id}
              onClick={() => navigate(`/forum/${topicName}/${discussion._id}`)}
            >
              <h3>{discussion.Title}</h3>
              <h5>{discussion.Description}</h5>
              <p>Answers: {discussion.Answers.length}</p>
            </div>
          ))}
      </div>
      <button onClick={handleCreateDiscussionButton}>
        Create New Discussion
      </button>
      {creatingDiscussion && (
        <div className='create-new-topic'>
          <input
            type='text'
            placeholder='new discussion title'
            ref={discussionTitleRef}
          />
          <input
            type='text'
            placeholder='discussion description'
            ref={discussionDescriptionRef}
          />
          <button onClick={handleDiscussionCreate}>Create Discussion</button>
          <button onClick={() => setCreatingDiscussion(false)}>Close</button>
        </div>
      )}
    </div>
  );
}

export default TopicPage;
