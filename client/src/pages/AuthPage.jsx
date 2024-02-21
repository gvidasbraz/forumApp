import React from 'react';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';

function AuthPage() {
  return (
    <div className='auth-page'>
      <LoginForm />
      <RegisterForm />
    </div>
  );
}

export default AuthPage;
