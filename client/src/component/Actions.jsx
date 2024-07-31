import {
  Box,
  Button,
  Flex,
  FormControl,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useShowToast from "../hooks/useShowToast";
import { BsChat, BsArrowRepeat, BsShare } from "react-icons/bs";
import { FcLike } from "react-icons/fc";
import { GoHeart } from "react-icons/go";
import { useState } from "react";
import { useParams } from "react-router-dom";

const Actions = ({ post, postType = '' }) => {
  const { username } = useParams();
  const { pid } = useParams()
  const { isOpen, onOpen, onClose } = useDisclosure();
  const showToast = useShowToast();
  const queryClient = useQueryClient();

  const { data: authUser } = useQuery({ queryKey: ['authUser'] });
  const liked = post.likes.includes(authUser?._id);

  const [commentText, setCommentText] = useState('')

  const { mutate: likeUnlikePost, isPending: isLiking } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch(`/api/posts/like/${post._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }

        return data;
      } catch (error) {
        console.error(error);
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      if (postType === "PostPage") {
        queryClient.setQueryData(['currentPost', pid], (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData, likes: liked
              ? oldData.likes.filter((uId) => uId !== authUser?._id)
              : [...oldData.likes, authUser?._id],
          }
        });
      }

      if (postType === "UserPage") {
        queryClient.setQueryData(['userPosts', username], (oldData) => {
          if (!oldData) return oldData;

          return oldData.map((Post) => {
            if (Post._id === post._id) {
              return {
                ...Post,
                likes: liked
                  ? Post.likes.filter((uId) => uId !== authUser?._id)
                  : [...Post.likes, authUser?._id],
              };
            }
            return Post;
          });
        });
      }

      if (postType === "FeedPosts") {
        queryClient.setQueryData(['feedPosts'], (oldData) => {
          if (!oldData) return oldData;

          return oldData.map((Post) => {
            if (Post._id === post._id) {
              return {
                ...Post,
                likes: liked
                  ? Post.likes.filter((uId) => uId !== authUser?._id)
                  : [...Post.likes, authUser?._id],
              };
            }
            return Post;
          });
        });
      }
    },

    onError: (error) => {
      showToast("Error", error.message, "error");
    },
  });

  const { mutate: replyToPost, isPending: isReplying } = useMutation({
    mutationFn: async (text) => {
      try {
        const res = await fetch(`/api/posts/reply/${post._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text })
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }

        console.log("dataaaaa", data);
        return data;
      } catch (error) {
        console.error(error);
        throw new Error(error.message);
      }
    },
    onSuccess: (data) => {
      if (postType === "PostPage") {
        queryClient.setQueryData(['currentPost', pid], (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData, replies: [...oldData.replies, data]
          }
        });
      }

      if (postType === "UserPage") {
        queryClient.setQueryData(['userPosts', username], (oldData) => {
          if (!oldData) return oldData;

          return oldData.map((Post) => {
            if (Post._id === post._id) {
              return {
                ...Post,
                replies: [...Post.replies, data]
              };
            }
            return Post;
          });
        });
      }

      if (postType === 'FeedPosts') {

        queryClient.setQueryData(['feedPosts'], (oldData) => {
          if (!oldData) return oldData;

          return oldData.map((Post) => {
            if (Post._id === post._id) {
              return {
                ...Post,
                replies: [...Post.replies, data]
              };
            }
            return Post;
          });
        });
      }
      showToast("Success", "Add Comment Successfully", "success");
      onClose()
    },
    onError: (error) => {
      showToast("Error", error.message, "error");
    },
  });
  return (
    <Flex flexDirection="column" onClick={(e) => e.preventDefault()}>
      <Flex gap={3} my={2}>
        <Button
          variant="unstyled"
          onClick={() => {
            if (isLiking) return;
            likeUnlikePost()
          }}
          isLoading={isLiking}
          aria-label="Like"
        >
          {liked ? <FcLike size="25" /> : <GoHeart size="24" />}
        </Button>

        <Button
          variant="unstyled"
          onClick={onOpen}
          aria-label="Comment"
        >
          <BsChat size="20" />
        </Button>

        <Button
          variant="unstyled"
          aria-label="Repost"
        >
          <BsArrowRepeat size="20" />
        </Button>

        <Button
          variant="unstyled"
          aria-label="Share"
        >
          <BsShare size="20" />
        </Button>
      </Flex>

      <Flex gap={2} alignItems={"center"}>
        <Text color={"gray.500"} fontSize="sm">
          {post.likes.length} likes
        </Text>
        <Box w={0.5} h={0.5} borderRadius={"full"} bg={"gray.500"}></Box>
        <Text color={"gray.500"} fontSize="sm">
          {post.replies.length} replies
        </Text>
      </Flex>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg={useColorModeValue("white", "gray.dark")}>
          <ModalHeader>Reply to Post</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <Input placeholder="Reply goes here.." onChange={(e) => setCommentText(e.target.value)} />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" size={"sm"} mr={3}
              onClick={() => {
                if (isReplying) return;
                replyToPost(commentText)
              }}
              isLoading={isReplying}
            >

              Reply
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default Actions;
