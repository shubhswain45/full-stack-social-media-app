import React from 'react';
import { Container, Spinner, Box, Text } from '@chakra-ui/react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import UserPage from './pages/UserPage';
import PostPage from './pages/PostPage';
import Header from './component/Header';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import { useQuery } from "@tanstack/react-query";
import UpdateProfilePage from './pages/UpdateProfilePage';
import CreatePost from './component/CreatePost';
import ChatPage from './pages/ChatPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  const { data: authUser, isLoading, error } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/users/me");
        const data = await res.json();
        if (data.error) return null;
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        console.log("authUser is here:", data);
        return data;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    retry: false,
  });

  if (isLoading) {
    return (
      <Container maxW={"620px"} minH="100vh" display="flex" alignItems="center" justifyContent="center">
        {/* <Spinner size="xl" /> */}
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW={"620px"} minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <Box textAlign="center">
          <Text fontSize="xl" color="red.500">An error occurred: {error.message}</Text>
        </Box>
      </Container>
    );
  }

  const { pathname } = useLocation()
  return (
    <Box position={"relative"} w={'full'}>
      <Container maxW={pathname === '/' ? {base: "620px", md: "900px"} : "620px"}>
        <Header />
        <Routes>
          <Route path='/' element={authUser ? <HomePage /> : <Navigate to='/auth' />} />
          <Route path='/auth' element={!authUser ? <AuthPage /> : <Navigate to='/' />} />
          <Route path='/update' element={authUser ? <UpdateProfilePage /> : <Navigate to='/auth' />} />
          <Route path='/:username' element={<UserPage />} />
          <Route path='/:username/post/:pid' element={<PostPage />} />
          <Route path='/chat' element={authUser ? <ChatPage /> : <Navigate to={'/auth'} />} />
          <Route path='/settings' element={authUser ? <SettingsPage /> : <Navigate to={'/auth'} />} />
        </Routes>

        {authUser && <CreatePost />}
      </Container>
    </Box>
  );
}

export default App;
