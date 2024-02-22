import React, { useState, useEffect } from 'react';
import http from '../plugins/http';
import { useStore } from '../store/myStore';

function MessagesPage() {
  const [allMessages, setAllMessages] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const token = localStorage.getItem('token');
  const { user, selectedUser, setSelectedUser } = useStore();

  const getUsersList = async () => {
    try {
      const response = await http.get(`getUserChats/${token}`);
      console.log(response);
      setUsersList(response.data);
    } catch (error) {
      console.error('Error fetching users list:', error);
    }
  };

  const getAllMessages = async () => {
    try {
      const response = await http.get(`getChat/${token}/${selectedUser._id}`);
      console.log(response);
      setAllMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async () => {
    try {
      await http.post('sendChat', {
        sender: token,
        receiver: selectedUser,
        content: newMessage,
      });
      setNewMessage('');
      getAllMessages();
      const chatContainer = document.querySelector('.messages-chat');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  useEffect(() => {
    getAllMessages();
  }, [selectedUser]);

  useEffect(() => {
    const chatContainer = document.querySelector('.messages-chat');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [allMessages]);

  useEffect(() => {
    if (user.length !== 0) {
      getUsersList();
    }
  }, [user]);

  useEffect(() => {
    if (user.length !== 0 && selectedUser.length !== 0) {
      getAllMessages();
      const markMessagesAsRead = async () => {
        try {
          await http.get(`getChat/${token}/${selectedUser._id}`);
          getUsersList();
        } catch (error) {
          console.error('Error marking messages as read:', error);
        }
      };

      markMessagesAsRead();
    }
  }, [user, selectedUser]);

  return (
    <div>
      {user.length === 0 ? (
        <p>Please log in to view and send messages.</p>
      ) : (
        <div className='messages-wrapper'>
          <div className='messages-users'>
            {usersList.length === 0 ? (
              <div>No messages yet.</div>
            ) : (
              <div className='messages-singleuser-wrapper'>
                {usersList.map((users) => (
                  <div
                    key={users._id}
                    onClick={() => setSelectedUser(users)}
                    className={`messages-singleuser ${
                      users._id === selectedUser._id ? 'selected' : ''
                    } 
                    ${users._id === user.id ? 'hidden' : ''}`}
                  >
                    <img src={users.profileImage} alt='' />
                    {users.username}
                    {users.unreadMessageCount > 0
                      ? ` (${users.unreadMessageCount})`
                      : ''}
                  </div>
                ))}
              </div>
            )}
          </div>
          {selectedUser.length !== 0 && (
            <div className='messages-chat'>
              <div className='chat-header'>
                Chatting with <strong>{selectedUser.username}</strong>
              </div>
              {allMessages.length > 0 ? (
                <ul className='chat-message-wrapper'>
                  {allMessages.map((message) => (
                    <li
                      key={message._id}
                      className={`chat-message ${
                        message.sender === selectedUser._id
                          ? 'align-right'
                          : 'align-left'
                      }`}
                    >
                      <div>
                        <strong>
                          {message.sender === selectedUser._id
                            ? selectedUser.username
                            : message.sender === user.id
                            ? user.username
                            : 'Error'}
                          :
                        </strong>{' '}
                        {message.content}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className='chat-message-wrapper'>No messages yet.</p>
              )}
              <div className='send-private-message-input-wrapper'>
                <label htmlFor='newMessage'></label>
                <input
                  className='chat-message-input'
                  placeholder='New message'
                  type='text'
                  id='newMessage'
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <button
                  className='send-message-btn'
                  onClick={handleSendMessage}
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MessagesPage;
