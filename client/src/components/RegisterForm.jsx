import React, { useState } from 'react';
import http from '../plugins/http';

function RegisterForm() {
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [role, setRole] = useState('user');

  const handleRegister = async (event) => {
    event.preventDefault();
    const username = event.target.elements.username.value;
    const password1 = event.target.elements.password1.value;
    const password2 = event.target.elements.password2.value;
    const role = event.target.elements.role.value;

    const user = { username, password1, password2, role };
    try {
      const response = await http.post('register', user);
      if (response.success) {
        setError('');
        setMsg(response.message);
      } else {
        setError(response.message);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred during registration.');
    }
  };

  return (
    <form onSubmit={handleRegister} className='registration-form'>
      <h2>Register</h2>
      <input type='text' name='username' placeholder='Username' required />
      <input type='password' name='password1' placeholder='Password' required />
      <input type='password' name='password2' placeholder='Password' required />
      <label htmlFor='role'>Select Role:</label>
      <select
        id='role'
        name='role'
        value={role}
        onChange={(e) => setRole(e.target.value)}
        defaultValue='user'
      >
        <option value='user'>User</option>
        <option value='admin'>Admin</option>
      </select>
      {error && <div className='error'>{error}</div>}
      {msg && <div className='msg'>{msg}</div>}

      <button type='submit' className='primary-btn'>
        Register
      </button>
    </form>
  );
}

export default RegisterForm;
