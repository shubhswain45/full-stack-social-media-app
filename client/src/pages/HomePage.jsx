import { Container, Spinner, Text, Flex, Box } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import React, { useEffect } from 'react';
import Post from '../component/Post';
import SuggestedUsers from '../component/SuggestedUsers';

function HomePage() {
  const { data: authUser } = useQuery({ queryKey: ['authUser'] })

  const { data: feedPosts, error, isLoading: loading } = useQuery({
    queryKey: ['feedPosts'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/posts/feed');
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (error) {
        throw new Error(error.message);
      }
    }
  });

  return (
		<Flex gap='10' alignItems={"flex-start"}>
			<Box flex={70}>
				{!loading && feedPosts.length === 0 && <h1>Follow some users to see the feed</h1>}

				{loading && (
					<Flex justify='center'>
						<Spinner size='xl' />
					</Flex>
				)}

				{feedPosts?.map((post) => (
					<Post key={post._id} post={post} postedBy={post.postedBy} postType={"FeedPosts"} />
				))}
			</Box>
			<Box
				flex={30}
				display={{
					base: "none",
					md: "block",
				}}
			>
				<SuggestedUsers />
			</Box>
		</Flex>
	);
};

export default HomePage;
