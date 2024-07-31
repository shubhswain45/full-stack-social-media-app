import React, { useEffect, useRef } from 'react';
import { Avatar, Box, Container, Divider, Flex, Skeleton, SkeletonCircle, Text, useColorModeValue } from '@chakra-ui/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useselectedConversation } from '../context/selectedConversationContext';
import { Link } from 'react-router-dom';
import Message from './Message';
import MessageInput from './MessageInput';
import { useSocket } from '../context/SocketContext';

function MessageContainer() {
    const { selectedConversation } = useselectedConversation();
    const { data: authUser } = useQuery({ queryKey: ['authUser'] });
    const { data: conversations } = useQuery({ queryKey: ['conversations'] });
    const queryClient = useQueryClient();
    const { socket } = useSocket();
    const messageEndRef = useRef();
    console.log("in messaeg cpontainer", selectedConversation.userProfilePic);

    const { data: messages, isLoading, error } = useQuery({
        queryKey: ['messages', selectedConversation?._id],
        queryFn: async () => {
            if (selectedConversation.mock) {
                return [];
            }
            const res = await fetch(`/api/messages/${selectedConversation?.userId}`);
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Something went wrong");
            }
            return data;
        },
        enabled: !!selectedConversation,
        refetchOnWindowFocus: false, // To avoid refetching on window focus
    });

    useEffect(() => {
        const lastMessageIsFromOtherUser = messages?.length && messages[messages?.length - 1].sender !== authUser._id;

        if (lastMessageIsFromOtherUser) {
            socket.emit("markMessagesAsSeen", {
                conversationId: selectedConversation._id,
                userId: selectedConversation.userId 
            })
        }

        socket.on("messagesSeen", ({ conversationId }) => {
            if (selectedConversation._id === conversationId) {
                queryClient.setQueryData(['messages', selectedConversation._id], (oldData = []) => {
                    const updatedMessages = oldData.map(message => {
                        if (!message.seen) {
                            return {
                                ...message,
                                seen: true
                            }
                        }
                        return message;
                    })
                    return updatedMessages;
                });
            }

            queryClient.setQueryData(['conversations'], (oldData = []) => {
                return oldData.map(conv => {
                    if(selectedConversation._id === conv._id){
                        return {
                            ...conv,
                            lastMessage: {
                                ...conv.lastMessage,
                                seen: true
                            }
                        }
                    }
                    return conv;
                })
            })

        })
    }, [socket, authUser._id, messages, selectedConversation])

    useEffect(() => {
        if (socket) {
            const handleMessage = (message) => {

                if (message.conversationId === selectedConversation._id) {
                    queryClient.setQueryData(['messages', selectedConversation._id], (oldData = []) => {
                        return [...oldData, message];
                    });
                }

                queryClient.setQueryData(['conversations'], (oldData = []) => {
                    return oldData.map(conv => {
                        if (conv._id === message.conversationId) {
                            return {
                                ...conv,
                                lastMessage: {
                                    text: message.text || "Send a photo",
                                    sendingTime: message.createdAt,
                                    sender: message.sender,
                                    seen: true
                                }
                            }
                        }
                        return conv;
                    })
                });
            };
            socket.on("newMessage", handleMessage);

            return () => socket.off("newMessage", handleMessage);
        }
    }, [socket, messages, selectedConversation]);

    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    return (
        <Flex
            flex='70'
            bg={useColorModeValue("white", "gray.dark")}
            borderRadius={"md"}
            p={2}
            flexDirection={"column"}
        >
            <>
                <Flex w={"full"} h={12} alignItems={"center"} gap={2}>
                    <Link to={`/${selectedConversation.username}`}>
                        {
                            selectedConversation.userProfilePic ? <Avatar src={selectedConversation.userProfilePic} size={"sm"} /> : <Avatar src={"https://thumbs.dreamstime.com/b/default-avatar-profile-flat-icon-social-media-user-vector-portrait-unknown-human-image-default-avatar-profile-flat-icon-184330869.jpg"} size={"sm"} />
                        }
                    </Link>
                    <Link to={`/${selectedConversation.username}`}>
                        <Text display={"flex"} alignItems={"center"}>
                            {selectedConversation.username}
                        </Text>
                    </Link>
                </Flex>

                <Divider />

                <Flex flexDir={"column"} gap={4} my={4} p={2} height={"400px"} overflowY={"auto"}>
                    {isLoading &&
                        [...Array(10)].map((_, i) => (
                            <Flex
                                key={i}
                                gap={2}
                                alignItems={"center"}
                                p={1}
                                borderRadius={"md"}
                                alignSelf={i % 2 === 0 ? "flex-start" : "flex-end"}
                            >
                                {i % 2 === 0 && <SkeletonCircle size={7} />}
                                <Flex flexDir={"column"} gap={2}>
                                    <Skeleton h='8px' w='250px' />
                                    <Skeleton h='8px' w='250px' />
                                    <Skeleton h='8px' w='250px' />
                                </Flex>
                                {i % 2 !== 0 && <SkeletonCircle size={7} />}
                            </Flex>
                        ))}
                    {!isLoading && messages.length !== 0 &&
                        messages.map(message => (
                            <Flex key={message._id} direction={"column"}
                                ref={messages.length - 1 === messages.indexOf(message) ? messageEndRef : null}
                            >
                                <Message message={message} ownMessage={message.sender === authUser._id} />
                            </Flex>
                        ))}
                </Flex>
            </>
            <MessageInput />
        </Flex>
    );
}

export default MessageContainer;
