import UserHeader from '../component/UserHeader';
import { Container, Flex, Spinner, Text } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Post from '../component/Post';

function UserPage() {
  const { username } = useParams();

  const {   // To Get UserProfile info
    data: userProfileData,
    error: userProfileError,
    isLoading: isUserProfileLoading,
  } = useQuery({
    queryKey: ['userProfile', username], // Include username in the query key
    queryFn: async () => {
      try {
        const response = await fetch(`/api/users/profile/${username}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Something went wrong');
        }

        return data;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    refetchOnWindowFocus: true, // Refetch when the window regains focus
  });

  const {  // To get all userPosts
    data: userPostsData,
    error: userPostsError,
    isLoading: isUserPostsLoading,
  } = useQuery({
    queryKey: ['userPosts', username], // Include username in the query key
    queryFn: async () => {
      try {
        const response = await fetch(`/api/posts/user/${username}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Something went wrong');
        }

        return data;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    refetchOnWindowFocus: true, // Refetch when the window regains focus
  });

  console.log(userProfileData, '----------------------');
  if (isUserProfileLoading || isUserPostsLoading) {
    return (
      <Container maxW={'620px'} minH='100vh' display='flex' alignItems='center' justifyContent='center'>
        <Spinner size='xl' />
      </Container>
    );
  }

  if (userProfileError || userPostsError) {
    return (
      <Container maxW={'620px'} minH='100vh' display='flex' alignItems='center' justifyContent='center' fontSize={30}>
        <Text>{userProfileError?.message || userPostsError?.message}</Text>
      </Container>
    );
  }

  if (userProfileData.isFrozen) {
    return <Container maxW={'620px'} minH='100vh' display='flex' alignItems='center' justifyContent='center'>
      <Text>This account is Frozen</Text>
    </Container>
  }

  return (
    <>
      <UserHeader userProfile={userProfileData} />
      <Flex mt={5} direction={'column'}>
        {userPostsData.length === 0 && (
          <Flex align='center' justify='center' minH='200px' size={20}>
            <Text>No Post Yet</Text>
          </Flex>
        )}
        {userPostsData?.length > 0 && userPostsData.map(post => (
          <Post key={post._id} post={post} postedBy={post.postedBy} postType={'UserPage'} />
        ))}
      </Flex>
    </>
  );
}

export default UserPage;
