import React, { useState } from 'react';
import LoginForm from '../component/LoginForm';
import SignUpForm from '../component/SignUpForm';
import { useAuth } from '../context/authContext';

const AuthPage = () => {
    const {authState} = useAuth()
  return (
    <>
      {authState === 'login' ? <LoginForm  /> : <SignUpForm />}
    </>
  );
};

export default AuthPage;
