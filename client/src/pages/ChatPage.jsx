import React, { useEffect, useState } from 'react';
import { Box, Button, Flex, Input, Skeleton, SkeletonCircle, Text, useColorModeValue } from '@chakra-ui/react';
import { IoIosSearch } from 'react-icons/io';
import Conversation from '../component/Conversation';
import MessageContainer from '../component/MessageContainer';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useselectedConversation } from '../context/selectedConversationContext';
import { IoLogoWechat } from "react-icons/io5";
import useShowToast from '../hooks/useShowToast';
import { useSocket } from '../context/SocketContext';

function ChatPage() {
    const queryClient = useQueryClient();
    const { selectedConversation, setSelectedConversation } = useselectedConversation();
    const { data: authUser } = useQuery({ queryKey: ['authUser'] })
    const showToast = useShowToast()

    const [searchText, setSearchText] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);

    const {socket, onlineUsers} = useSocket()
    //This is for fetching the all conversation that we did with other user 
    const { data: conversations, isLoading: conversationsLoading } = useQuery({
        queryKey: ['conversations'],
        queryFn: async () => {
            const res = await fetch('/api/messages/conversations');
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Something went wrong");
            }

            return data.sort((a, b) => new Date(b.lastMessage.sendingTime) - new Date(a.lastMessage.sendingTime));
        }
    });

    // This is for search the the user in chat page 
    const handleConversationsSearch = async (e) => {
        e.preventDefault();
        if (searchText.trim()) {
            setSearchLoading(true);
            try {
                const res = await fetch(`/api/users/profile/${searchText}`);
                const data = await res.json();

                if (!res.ok) {
                    showToast("Error", data.error, "error")
                    return;
                }

                const conversationAlreadyExists = conversations.find((conversation) => conversation.participants[0]._id === data._id);

                if (conversationAlreadyExists) {
                    setSelectedConversation({
                        _id: conversationAlreadyExists._id,
                        userId: data._id,
                        userProfilePic: data.profilePic,
                        username: data.username
                    });
                } else {
                    const mockConversation = {
                        mock: true,
                        lastMessage: {
                            text: "",
                            sender: "",
                            sendingTime: ""
                        },
                        _id: Date.now(),
                        participants: [
                            {
                                _id: data._id,
                                username: data.username,
                                profilePic: data.profilePic
                            }
                        ]
                    };
                    queryClient.setQueryData(['conversations'], (oldData = []) => [...oldData, mockConversation]);
                }

                setSearchResult(data);
            } catch (error) {
                console.error(error.message);
            } finally {
                setSearchLoading(false);
            }
        }
    };

    useEffect(() => {
        if (socket) {
            const handleMessage = (message) => {
                queryClient.setQueryData(['conversations'], (oldData = []) => {
                    const updatedConversation = oldData.map(conv => {
                        if (conv._id === message.conversationId) {
                            return {
                                ...conv,
                                lastMessage: {
                                    text: message.text || "Send a photo",
                                    sendingTime: message.createdAt,
                                    sender: message.sender,
                                    seen: false
                                }
                            }
                        }
                        return conv;
                    })
                    return updatedConversation.sort((a, b) => new Date(b.lastMessage.sendingTime) - new Date(a.lastMessage.sendingTime))
                });
            };
            socket.on("newMessage", handleMessage);

            return () => socket.off("newMessage", handleMessage);
        }
    }, [socket, queryClient]);


    useEffect(() => {
        if (socket) {
            socket.on("messagesSeen", ({ conversationId }) => {
                queryClient.setQueryData(['conversations'], (oldData = []) => {
                    return oldData.map(conv => {
                        if (conversationId === conv._id) {
                            return {
                                ...conv,
                                lastMessage: {
                                    ...conv.lastMessage,
                                    seen: true
                                }
                            };
                        }
                        return conv;
                    });
                });
            });
        }
    }, [socket, queryClient, authUser]);
    console.log("confffffffffffff", conversations);

    return (
        <Box
            position={'absolute'}
            left={'50%'}
            w={{ base: '100%', md: '80%', lg: '750px' }}
            p={4}
            transform={'translateX(-50%)'}
            bg={useColorModeValue("white", "gray.dark")}
            borderRadius={'10px'}
        >
            <Flex
                gap={4}
                flexDirection={{ base: 'column', md: 'row' }}
                maxW={{ sm: '400px', md: 'full' }}
                mx={'auto'}
            >
                <Flex flex={30} gap={2} flexDirection={'column'} maxW={{ sm: '250px', md: 'full' }} mx={'auto'}>
                    <Text fontWeight={700} color={useColorModeValue('gray.600', 'gray.400')}>
                        Your Conversations
                    </Text>

                    <form onSubmit={handleConversationsSearch}>
                        <Flex alignItems={'center'} gap={2}>
                            <Input
                                placeholder='Search for a user'
                                onChange={(e) => setSearchText(e.target.value)}
                                value={searchText}
                            />
                            <Button size={'sm'} type="submit">
                                <IoIosSearch size={30} />
                            </Button>
                        </Flex>
                    </form>

                    {conversationsLoading ? (
                        [0, 1, 2, 3, 4].map((_, i) => (
                            <Flex key={i} gap={4} alignItems={'center'} p={'1'} borderRadius={'md'}>
                                <Box>
                                    <SkeletonCircle size={'10'} />
                                </Box>
                                <Flex w={'full'} flexDirection={'column'} gap={3}>
                                    <Skeleton h={'10px'} w={'80px'} />
                                    <Skeleton h={'8px'} w={'90%'} />
                                </Flex>
                            </Flex>
                        ))
                    ) : (
                        conversations.map((conversation) => (
                            <Conversation key={conversation.id} conversation={conversation} isOnline={onlineUsers.includes(conversation.participants[0]._id)} />
                        ))
                    )}

                    {searchLoading && (
                        <Flex flexDirection={'column'} gap={4} mt={4}>
                            <SkeletonCircle size={'10'} />
                            <Skeleton h={'10px'} w={'80px'} />
                            <Skeleton h={'8px'} w={'90%'} />
                        </Flex>
                    )}
                </Flex>

                {!selectedConversation && (
                    <Flex
                        flex={70}
                        borderRadius={"md"}
                        p={2}
                        flexDir={"column"}
                        alignItems={"center"}
                        justifyContent={"center"}
                        height={"400px"}
                    >
                        <IoLogoWechat size={100} />
                        <Text fontSize={20}>Select a conversation to start messaging</Text>
                    </Flex>
                )}

                {selectedConversation && <MessageContainer />}
            </Flex>
        </Box>
    );
}

export default ChatPage;
