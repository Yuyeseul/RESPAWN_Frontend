import React from 'react';
import { Routes, Route } from 'react-router-dom';
import GlobalStyle from './styles/GlobalStyle';
import MainPage from './pages/Home';
import LogInPage from './pages/Login';
import SignUpPage from './pages/SignUpPage';
import NotFoundPage from './pages/NotFoundPage';
import UserInfo from './pages/UserInfo';

function App() {
  return (
    <>
      <GlobalStyle />
      <Routes>
        <Route path="/home" element={<MainPage />} />
        <Route path="/login" element={<LogInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path='/userInfo' element={<UserInfo />} />
        <Route path="/*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;
