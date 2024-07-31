import React, { useRef, useState, useEffect } from 'react';
import {
    Button,
    Flex,
    FormControl,
    FormLabel,
    Input,
    Stack,
    useColorModeValue,
    Avatar,
    Box,
    IconButton,
} from "@chakra-ui/react";
import { FiCamera } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import usePreviewImg from '../hooks/usePreviewImg';
import useUpdateUserProfile from '../hooks/useUpdateUserProfile';

const UpdateProfilePage = () => {
    const { data: authUser, isLoading, error } = useQuery({queryKey: ['authUser']});
    
    console.log('authUser', authUser);

    // Initialize state with authUser data
    const [inputs, setInputs] = useState({
        name: '',
        email: '',
        username: '',
        bio: '',
        password: '' // Make sure this is included
    });

    useEffect(() => {
        if (authUser) {
            setInputs({
                name: authUser.name || '',
                email: authUser.email || '',
                username: authUser.username || '',
                bio: authUser.bio || '',
                password: '' // Reset password input field
            });
        }
    }, [authUser]);

    const fileRef = useRef();
    const { handleImageChange, imgUrl } = usePreviewImg();

    // Update profilePic in inputs when imgUrl changes
    useEffect(() => {
        if (imgUrl) {
            setInputs((prev) => ({
                ...prev,
                profilePic: imgUrl
            }));
        }
    }, [imgUrl]);

    const { mutate: updateUserProfile, isPending } = useUpdateUserProfile(authUser?._id);

    const handleSubmit = (e) => {
        e.preventDefault();
        if(isPending) return;
        updateUserProfile({...inputs, profilePic: imgUrl});
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <Flex align="center" justify="center" minH="100vh" p={4}>
            <Box as="form" onSubmit={handleSubmit} bg={useColorModeValue("white", "gray.dark")} p={8} borderRadius="lg" shadow="md" w="full" maxW="md">
                <Stack spacing={6}>
                    <Flex direction="column" align="center">
                        <Avatar size="2xl" src={imgUrl || authUser.profilePic} mb={4} border="4px solid"/>
                        <IconButton
                            aria-label="Change Avatar"
                            icon={<FiCamera />}
                            size="lg"
                            bg={useColorModeValue("white", "gray.dark")}
                            color={useColorModeValue("gray.800", "white")}
                            borderRadius="full"
                            isRound
                            mb={4}
                            onClick={() => fileRef.current.click()}
                        />
                        <Input type='file' hidden ref={fileRef} onChange={handleImageChange} />
                    </Flex>

                    <FormControl mt={-55}>
                        <FormLabel>Full Name</FormLabel>
                        <Input
                            placeholder="John Doe"
                            value={inputs.name}
                            onChange={(e) => setInputs({ ...inputs, name: e.target.value })}
                            _placeholder={{ color: "gray.500" }}
                        />
                    </FormControl>

                    <FormControl>
                        <FormLabel>Username</FormLabel>
                        <Input
                            placeholder="johndoe"
                            value={inputs.username}
                            onChange={(e) => setInputs({ ...inputs, username: e.target.value })}
                            _placeholder={{ color: "gray.500" }}
                        />
                    </FormControl>

                    <FormControl>
                        <FormLabel>Email Address</FormLabel>
                        <Input
                            type="email"
                            placeholder="your-email@example.com"
                            value={inputs.email}
                            onChange={(e) => setInputs({ ...inputs, email: e.target.value })}
                            _placeholder={{ color: "gray.500" }}
                        />
                    </FormControl>

                    <FormControl>
                        <FormLabel>Bio</FormLabel>
                        <Input
                            placeholder="Your bio"
                            value={inputs.bio}
                            onChange={(e) => setInputs({ ...inputs, bio: e.target.value })}
                            _placeholder={{ color: "gray.500" }}
                        />
                    </FormControl>

                    <FormControl>
                        <FormLabel>Password</FormLabel>
                        <Input
                            type="password"
                            placeholder="********"
                            value={inputs.password}
                            onChange={(e) => setInputs({ ...inputs, password: e.target.value })}
                            _placeholder={{ color: "gray.500" }}
                        />
                    </FormControl>

                    <Stack direction={["column", "row"]} spacing={4}>
                        <Button bg="red.400" color="white" _hover={{ bg: "red.500" }} flex="1">
                            Cancel
                        </Button>
                        <Button bg="green.400" color="white" _hover={{ bg: "green.500" }} flex="1" type="submit">
                           {isPending ? "Updating..." : "Update"}
                        </Button>
                    </Stack>
                </Stack>
            </Box>
        </Flex>
    );
};

export default UpdateProfilePage;
