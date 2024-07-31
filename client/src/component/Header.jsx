import React from 'react';
import { Flex, useColorMode, Image, Link } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AiFillHome } from 'react-icons/ai';
import { RxAvatar } from 'react-icons/rx';
import { IoChatbubbleEllipsesOutline } from 'react-icons/io5';
import { useAuth } from '../context/authContext';
import LogoutButton from './LogoutButton';
import { MdOutlineSettings } from 'react-icons/md';

function Header() {
  const { toggleColorMode, colorMode } = useColorMode();
  const { data: authUser } = useQuery({ queryKey: ['authUser'] });
  const { setAuthState } = useAuth();

  return (
    <Flex justifyContent={'space-between'} mt={6} mb='12'>
      {authUser && (
        <Link as={RouterLink} to='/'>
          <AiFillHome size={24} />
        </Link>
      )}
      {!authUser && (
        <Link as={RouterLink} to={'/auth'} onClick={() => setAuthState('login')}>
          Login
        </Link>
      )}

      <Image
        cursor={'pointer'}
        alt='logo'
        w={10}
        src={'https://images.vexels.com/content/142789/preview/multicolor-swirls-circle-logo-41322f.png'}
        onClick={toggleColorMode}
      />

      {authUser && (
        <Flex alignItems={'center'} gap={4} mt={-5}>

          <Link as={RouterLink} to={'/chat'}>
            <IoChatbubbleEllipsesOutline size={24} />
          </Link>

          <Link as={RouterLink} to={`/settings`}>
            <MdOutlineSettings size={24} />
          </Link>

          <Link as={RouterLink} to={`/${authUser.username}`}>
            <RxAvatar size={24} />
          </Link>

          {authUser && <LogoutButton />}

        </Flex>
      )}

      {!authUser && (
        <Link as={RouterLink} to={'/auth'} onClick={() => setAuthState('signup')}>
          Sign up
        </Link>
      )}
    </Flex>
  );
}

export default Header;
