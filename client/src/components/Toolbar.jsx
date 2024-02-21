import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/myStore';
import http from '../plugins/http';

function Toolbar() {
  const {
    user,
    setUser,
    selectedUser,
    unreadMessagesCount,
    setUnreadMessagesCount,
    setSelectedUser,
  } = useStore();
  const token = localStorage.getItem('token');

  const getUnreadMessageCount = async () => {
    try {
      const response = await http.get(`getUserChats/${token}`);
      const totalUnreadMessageCount = response.data.reduce(
        (sum, obj) => sum + obj.unreadMessageCount,
        0
      );
      setUnreadMessagesCount(totalUnreadMessageCount);
    } catch (error) {
      console.error('Error fetching user chats:', error);
    }
  };

  useEffect(() => {
    if (token && user.id) {
      getUnreadMessageCount();
    }
  }, [token, user.id]);

  const handleLogout = async () => {
    await setUser([]);
    await setUnreadMessagesCount(0);
    await setSelectedUser([]);
    localStorage.removeItem('token');
    localStorage.removeItem('autoLogin');
  };

  useEffect(() => {
    if (selectedUser && user.id) {
      getUnreadMessageCount();
    }
  }, [selectedUser, getUnreadMessageCount]);

  return (
    <div className='toolbar'>
      <div className='toolbar-main'>
        <Link to='/profile'>Profile</Link>
        <Link to='/forum'>Forum</Link>
        <Link to='/messages'>
          Messages{' '}
          {user.length !== 0 &&
            unreadMessagesCount > 0 &&
            `(${unreadMessagesCount})`}
        </Link>
      </div>
      <div>
        {token && user && user.username && user.role && (
          <Link to='/' onClick={handleLogout}>
            Logout
          </Link>
        )}
        {user.length === 0 && <Link to='/'>Login</Link>}
      </div>
    </div>
  );
}

export default Toolbar;
