import React from 'react';
import { Avatar, AvatarBadge, Flex, Stack, Text, useColorModeValue, WrapItem, Image } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { useselectedConversation } from '../context/selectedConversationContext';

function timeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const secondsPast = (now.getTime() - date.getTime()) / 1000;

  if (secondsPast < 60) {
      return 'send just now';
  }
  if (secondsPast < 3600) {
      const minutes = Math.floor(secondsPast / 60);
      return `Send ${minutes}m Ago`;
  }
  if (secondsPast < 86400) {
      const hours = Math.floor(secondsPast / 3600);
      return `Send ${hours}h Ago`;
  }
  const days = Math.floor(secondsPast / 86400);
  return `Send ${days}d Ago`;
}


function Conversation({ conversation, isOnline }) {
  const { data: authUser } = useQuery({ queryKey: ['authUser'] })
  const {selectedConversation, setSelectedConversation} = useselectedConversation()

  return (
    <Flex
      gap={4}
      alignItems={'center'}
      p={'1'}
      _hover={{
        cursor: 'pointer',
        bg: useColorModeValue('gray.200', 'gray.700'),
        color: 'white',
      }}
      bg={selectedConversation?._id === conversation._id ? useColorModeValue('gray.200', 'gray.700') : useColorModeValue("white", "gray.dark") }
      borderRadius={'md'}

      onClick={() => setSelectedConversation({
        _id: conversation._id,
        userId: conversation.participants[0]._id,
        userProfilePic: conversation.participants[0].profilePic,
        username:  conversation.participants[0].username,
        mock: conversation.mock
      })}

    >
      <WrapItem>
        <Avatar
          size={{
            base: 'xs',
            sm: 'sm',
            md: 'md',
          }}
          src={conversation.participants[0].profilePic || "https://thumbs.dreamstime.com/b/default-avatar-profile-flat-icon-social-media-user-vector-portrait-unknown-human-image-default-avatar-profile-flat-icon-184330869.jpg"}
        >
          {isOnline && <AvatarBadge boxSize='1em' bg='green.500' />}
          
        </Avatar>
      </WrapItem>

      <Stack direction={'column'} fontSize={'sm'}>
        <Text fontWeight='700' display={'flex'} alignItems={'center'}>
          {conversation.participants[0].username} <Image src='/verified.png' w={4} h={4} ml={1} />
        </Text>
        <Text fontSize={'xs'} display={'flex'} alignItems={'center'} gap={1} mt={-2}>
          {authUser._id === conversation.lastMessage.sender ? !conversation.lastMessage.seen ? timeAgo(conversation.lastMessage.sendingTime) : "seen" :
            conversation.lastMessage.text.length > 18 ? conversation.lastMessage.text.substring(0, 18) + "..." : conversation.lastMessage.text
          }
        </Text>
      </Stack>
    </Flex>
  );
}

export default Conversation;
