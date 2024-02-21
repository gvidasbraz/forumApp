import React, { useState, useEffect, useRef } from 'react';
import http from '../plugins/http';
import { useStore } from '../store/myStore';
import { useNavigate } from 'react-router-dom';

function ForumPage() {
  const { user } = useStore();
  const [topics, setTopics] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [creatingTopic, setCreatingTopic] = useState(false);
  const topicTitleRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    if (user.length !== 0) {
      getTopics();
      setIsAdmin(user.role === 'admin');
    }
  }, [user]);

  const getTopics = async () => {
    http
      .get('topics')
      .then((response) => {
        console.log(response);
        setTopics(response.data);
      })
      .catch((error) => {
        console.error('Error fetching topics:', error);
      });
  };

  const handleCreateTopicButton = () => {
    setCreatingTopic(!creatingTopic);
  };

  const handleTopicCreate = async () => {
    const token = localStorage.getItem('token');
    const topicName = topicTitleRef.current.value;
    try {
      const response = await http.post('createTopic', { topicName, token });
      if (response.success) {
        console.log(response);
        topicTitleRef.current.value = '';
        getTopics();
      } else {
        console.log(response);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      {user.length === 0 ? (
        <p>Please log in to view and create topics.</p>
      ) : (
        <div>
          <h1>Forum Page</h1>
          <div className='forum-posts-container'>
            {topics &&
              topics.map((topic) => (
                <div
                  className='forum-posts'
                  key={topic._id}
                  onClick={() =>
                    navigate(`/forum/${topic.TopicName.toLowerCase()}`)
                  }
                >
                  <h3>{topic.TopicName.toUpperCase()}</h3>
                  <p>Discussions: {topic.Discussions.length}</p>
                </div>
              ))}
          </div>
          {isAdmin && (
            <button onClick={handleCreateTopicButton}>
              Toggle New Topic Creation
            </button>
          )}
          {creatingTopic && (
            <div className='new-topic-input'>
              <input
                type='text'
                placeholder='new topic title'
                ref={topicTitleRef}
              />
              <div className='button-wrapper'>
                <button onClick={handleTopicCreate}>Create Topic</button>
                <button onClick={() => setCreatingTopic(false)}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ForumPage;
