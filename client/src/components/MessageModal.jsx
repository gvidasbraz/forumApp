import React, { useState } from 'react';
import http from '../plugins/http';

function MessageModal({ onClose, userID }) {
  const [messageContent, setMessageContent] = useState('');

  const handleSendMessage = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await http.post('sendChat', {
        sender: token,
        receiver: userID,
        content: messageContent,
      });
      if (response.success) {
        console.log(response);
        onClose();
      } else {
        console.log(response);
      }
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className='send-private-message'>
      <textarea
        placeholder='Type your message...'
        value={messageContent}
        onChange={(e) => setMessageContent(e.target.value)}
      />
      <button onClick={handleSendMessage}>Send Message</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
}

export default MessageModal;
