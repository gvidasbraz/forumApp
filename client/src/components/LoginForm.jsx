import React, { useState } from 'react';
import http from '../plugins/http';
import { useStore } from '../store/myStore';
import { useNavigate } from 'react-router';

function LoginForm() {
  const { setUser } = useStore();
  const [error, setError] = useState();
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();

    const username = event.target.elements.username.value;
    const password1 = event.target.elements.password1.value;
    const loginCheckbox = event.target.elements.loginCheckbox.checked;
    const user = { username, password1 };

    try {
      const response = await http.post('login', user);
      if (response.success) {
        console.log(response);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('autoLogin', loginCheckbox);
        setUser({
          id: response.data.id,
          username: response.data.username,
          role: response.data.role,
          profileImage: response.data.profileImage,
        });
        console.log(`Setting user`);
        navigate('/profile');
      } else {
        setError(response.message || 'Login error');
      }
    } catch (error) {
      setError('Error. Try again');
    }
  };

  return (
    <form onSubmit={handleLogin} className='login-form'>
      <h2>Login</h2>
      <input type='text' name='username' placeholder='Username' />
      <input type='password' name='password1' placeholder='Password' />
      <div className='checkbox-container'>
        <input type='checkbox' name='loginCheckbox' className='checkbox' />
        <label className='auto-login' htmlFor='auto-login'>
          Stay logged in
        </label>
      </div>
      <div className='error'>{error}</div>
      <button type='submit' className='primary-btn'>
        Login
      </button>
    </form>
  );
}

export default LoginForm;
