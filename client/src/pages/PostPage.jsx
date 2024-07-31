import {
  Avatar,
  Box,
  Button,
  Divider,
  Flex,
  Image,
  Text,
  Spinner,
  Container,
  Icon
} from "@chakra-ui/react";
import Actions from "../component/Actions";
import Comment from "../component/Comment";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from 'date-fns';
import useDeletePost from "../hooks/useDeletePost";
import useConfirmationPopup from "../hooks/useConfirmationPopUp";
import { MdDelete } from "react-icons/md";

const PostPage = () => {
  const { username, pid } = useParams();
  const navigate = useNavigate();

  const { data: authUser } = useQuery({ queryKey: ['authUser'] });
  const { mutate: deletePost, isPending: isPostDeleting, isSuccess } = useDeletePost();
  const { ConfirmationModal, requestConfirm } = useConfirmationPopup();

  const {  // To Get the User Who Post this Post 😉
    data: userProfileData,
    error: userProfileError,
    isLoading: isUserProfileLoading
  } = useQuery({
    queryKey: ['userProfile', username],
    queryFn: async () => {
      const response = await fetch(`/api/users/profile/${username}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Something went wrong');
      return data;
    },
    refetchOnWindowFocus: true,
  });

  const {  // To Get the current Post, By PostId
    data: currentPost,
    error: currentPostError,
    isLoading: isCurrentPostLoading
  } = useQuery({
    queryKey: ['currentPost', pid],
    queryFn: async () => {
      const response = await fetch(`/api/posts/${pid}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Something went wrong');
      return data;
    },
    refetchOnWindowFocus: true,
  });

  if (isSuccess) {
    navigate(`/${username}`);
  }

  if (isUserProfileLoading || isCurrentPostLoading) {
    return (
      <Container maxW="620px" minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <Spinner size="xl" />
      </Container>
    );
  }

  if (userProfileError || currentPostError) {
    return (
      <Container maxW="620px" minH="100vh" display="flex" alignItems="center" justifyContent="center">
        <Text fontSize="xl" color="red.500">
          {userProfileError?.message || currentPostError?.message}
        </Text>
      </Container>
    );
  }

  return (
    <>
      <Flex>
        <Flex w="full" alignItems="center" gap={3}>
          <Link to={`/${userProfileData.username}`}><Avatar src={userProfileData?.profilePic} size="md" /></Link>
          <Link to={`/${userProfileData.username}`}> <Text fontSize="sm" fontWeight="bold">
            {userProfileData?.username}
          </Text></Link>
        </Flex>
        <Flex gap={4} alignItems="center">
          <Text fontSize="xs" width={36} textAlign="right" color="gray.light">
            {formatDistanceToNow(new Date(currentPost.createdAt))}
          </Text>
          {authUser?._id === currentPost?.postedBy && (
            <Button
              variant="link"
              _hover={{ color: 'red.500' }}
              isLoading={isPostDeleting}
              onClick={() => {
                requestConfirm(
                  'Are you sure you want to delete this post? This action cannot be undone.',
                  'Delete',
                  () => deletePost(currentPost._id),
                  'red'
                );
              }}
              p={0}
            >
              <Icon as={MdDelete} boxSize={6} />
            </Button>
          )}
        </Flex>
      </Flex>

      <Text my={3}>{currentPost.text}</Text>

      {currentPost.img && (
        <Box borderRadius={6} overflow="hidden" border="1px solid" borderColor="gray.light">
          <Image src={currentPost.img} w="full" />
        </Box>
      )}

      <Flex gap={3} my={3}>
        <Actions post={currentPost} postType="PostPage" />
      </Flex>

      {currentPost.replies.map((reply, i) => (
        <Comment key={i} reply={reply} lastReply={i === currentPost.replies.length} />
      ))}
      <Divider my={4} />

      <Flex justifyContent="space-between">
        <Flex gap={2} alignItems="center">
          <Text fontSize="2xl">👋</Text>
          <Text color="gray.light">Get the app to like, reply and post.</Text>
        </Flex>
        <Button>Get</Button>
      </Flex>

      <Divider my={4} />
      {ConfirmationModal}
    </>
  );
};

export default PostPage;
