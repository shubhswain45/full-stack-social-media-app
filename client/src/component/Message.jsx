import { Avatar, Box, Flex, Image, Skeleton, Text } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { useselectedConversation } from '../context/selectedConversationContext';

function Message({ message, ownMessage = true }) {
    const [imgLoaded, setImgLoaded] = useState(false);
    const { data: authUser } = useQuery({ queryKey: ['authUser'] });
    const { selectedConversation } = useselectedConversation();

    return (
        <>
            {ownMessage ? (
                <Flex gap={2} alignSelf={"flex-end"} alignItems={"flex-end"} mt={5}>
                    {message.text && (
                        <Flex
                            bg={"#0095f6"}
                            maxW={"350px"}
                            p={2}
                            borderRadius={"md"}
                            position={"relative"}
                            _hover={{
                                background: 'linear-gradient(to bottom, #33ccff 0%, #ff6699 100%)'
                            }}
                            direction={"column"} // Align text vertically
                        >
                            <Text color={"white"}>{message.text}</Text>
                            {message.seen && (
                                <Box
                                    position={"absolute"}
                                    bottom={-4}  // Adjust this value to move the "Seen" text further down if needed
                                    right={1}
                                    color={"blue.400"}
                                    fontWeight={"bold"}
                                    display={"flex"}
                                    alignItems={"center"}
                                    gap={1}
                                >
                                    <Text fontSize={"xs"}>Seen</Text>
                                </Box>
                            )}
                        </Flex>
                    )}
                    {message.img && !imgLoaded && (
                        <Flex position={"relative"} mt={5} w={"200px"}>
                            <Image
                                src={message.img}
                                hidden
                                onLoad={() => setImgLoaded(true)}
                                alt='Message image'
                                borderRadius={4}
                            />

                            <Skeleton w={"200px"} h={"200px"} />
                        </Flex>
                    )}

                    {message.img && imgLoaded && (
                        <Flex position={"relative"} mt={5} w={"200px"}>
                            <Image
                                src={message.img}
                                onLoad={() => setImgLoaded(true)}
                                alt='Message image'
                                borderRadius={4}
                            />

                            {message.seen && (
                                <Box
                                    position={"absolute"}
                                    bottom={-4}  // Adjust this value to move the "Seen" text further down if needed
                                    right={1}
                                    color={"blue.400"}
                                    fontWeight={"bold"}
                                    display={"flex"}
                                    alignItems={"center"}
                                    gap={1}
                                >
                                    <Text fontSize={"xs"}>Seen</Text>
                                </Box>
                            )}
                        </Flex>
                    )}
                    <Avatar src={authUser.profilePic} w='7' h={7} />
                </Flex>
            ) : (
                <Flex gap={2} mt={5}>
                    <Avatar src={selectedConversation.userProfilePic} w='7' h={7} />
                    {message.text && (
                        <Text maxW={"350px"} bg={"#484d6e"} borderRadius={"md"} color={"white"} p={2}>
                            {message.text}
                        </Text>
                    )}
                    {message.img && !imgLoaded && (
                        <Flex position={"relative"} mt={5} w={"200px"}>
                            <Image
                                src={message.img}
                                hidden
                                onLoad={() => setImgLoaded(true)}
                                alt='Message image'
                                borderRadius={4}
                            />

                            <Skeleton w={"200px"} h={"200px"} />
                        </Flex>
                    )}
                    {message.img && imgLoaded && (
                        <Flex position={"relative"} mt={5} w={"200px"}>
                            <Image
                                src={message.img}
                                onLoad={() => setImgLoaded(true)}
                                alt='Message image'
                                borderRadius={4}
                            />
                        </Flex>
                    )}
                </Flex>
            )}
        </>
    );
}

export default Message;
