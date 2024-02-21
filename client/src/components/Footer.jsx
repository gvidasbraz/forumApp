import React from 'react';
import { useStore } from '../store/myStore';
import { useEffect } from 'react';
import http from '../plugins/http';
import { useNavigate } from 'react-router-dom';

function Footer() {
  const { user, setUser } = useStore();
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const autoLogin = localStorage.getItem('autoLogin');

  useEffect(() => {
    if (autoLogin !== 'true' && !user) {
      navigate('/');
    }
    if (token && autoLogin === 'true') {
      http
        .post('autoLogin', { token })
        .then((response) => {
          console.log(response);
          setUser({
            id: response.id,
            username: response.username,
            role: response.role,
            profileImage: response.profileImage,
          });
          navigate('/profile');
        })
        .catch((error) => {});
    }
  }, []);
  return <div></div>;
}

export default Footer;
