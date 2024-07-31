import { useState } from 'react';
import { Avatar, Box, Button, Container, Flex, Icon, Image, Spinner, Text } from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Actions from './Actions';
import { formatDistanceToNow } from 'date-fns';
import { MdDelete } from 'react-icons/md';
import useDeletePost from '../hooks/useDeletePost';
import useConfirmationPopup from '../hooks/useConfirmationPopUp';

const Post = ({ post, postedBy, postType }) => {
    const navigate = useNavigate();
    const { ConfirmationModal, requestConfirm } = useConfirmationPopup(); // Use Confirmation Model

    const { mutate: deletePost, isPending: isPostDeleting } = useDeletePost(); // Use Hook To Delete A Post

    const { data: authUser } = useQuery({ queryKey: ['authUser'] }); // To Get The AuthUser

    const { data: user, isLoading, error } = useQuery({  // To Get The User Who Create This Post (Showing the Username and Profile)
        queryKey: ['user', postedBy], // Just Remember if Key is Same it will not refetch rather store in Cache
        queryFn: async () => {
            try {
                const res = await fetch(`/api/users/profile/${postedBy}`);
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Something went wrong');
                return data;
            } catch (error) {
                throw new Error(error.message);
            }
        },
        enabled: !!postedBy,
    });

    if (error) {
        return (
            <Container maxW={'620px'} minH='100vh' display='flex' alignItems='center' justifyContent='center' fontSize={30}>
                {error.message}
            </Container>
        );
    }

    if (isLoading) {
        return (
            <Container maxW={'620px'} minH='100vh' display='flex' alignItems='center' justifyContent='center'>
                <Spinner size='xl' />
            </Container>
        );
    }

    return (
        <>
            <Link to={`/${user.username}/post/${post._id}`}>
                <Box overflow='hidden' boxShadow='md' mb={6}>
                    <Flex alignItems='center' p={4}>
                        <Avatar size='md' src={user.profilePic} onClick={(e) => { e.preventDefault(), navigate(`/${user.username}`) }} />
                        <Box ml={3} flex='1'>
                            <Flex alignItems='center'>
                                <Text fontSize='md' fontWeight='bold' mr={2} onClick={(e) => { e.preventDefault(), navigate(`/${user.username}`) }}>
                                    {user.username}
                                </Text>
                            </Flex>
                            <Text fontSize='sm' color='gray.500' onClick={(e) => { e.preventDefault(), navigate(`/${user.username}`) }}>
                                {formatDistanceToNow(post.createdAt)}
                            </Text>
                        </Box>
                        {authUser?._id.toString() === post?.postedBy.toString() && (
                            <Button
                                variant='link'
                                _hover={{ color: 'red.500' }}
                                isLoading={isPostDeleting}
                                onClick={(e) => {
                                    e.preventDefault();
                                    requestConfirm(
                                        'Are you sure you want to delete this post? This action cannot be undone.',
                                        'Delete',
                                        () => {
                                            deletePost(post._id);
                                            // After deletion, you might want to handle redirection or state update
                                        },
                                        'red',
                                    );
                                }}
                                p={0}
                            >
                                <Icon as={MdDelete} boxSize={6} />
                            </Button>
                        )}
                    </Flex>
                    <Box p={4}>
                        <Text fontSize='md' mb={3}>
                            {post.text}
                        </Text>
                        {post.img && (
                            <Box borderRadius='md' overflow='hidden' mb={4}>
                                <Image src={post.img} alt='Post Image' />
                            </Box>
                        )}
                        <Actions post={post} postType={postType} />
                    </Box>
                </Box>
            </Link>
            {ConfirmationModal}
        </>
    );
};

export default Post;
