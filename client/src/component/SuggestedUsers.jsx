import { Box, Flex, Skeleton, SkeletonCircle, Text } from '@chakra-ui/react'
import React from 'react'
import SuggestedUser from './SuggestedUser'
import { useQuery } from '@tanstack/react-query'

function SuggestedUsers() {

    const {data: suggestedUsers, isLoading, error} = useQuery({
        queryKey: ['suggestedUsers'],
        queryFn: async () => {
            try {
                const res = await fetch('/api/users/suggested');
                const data = await res.json()

                if(!res.ok){
                    throw new Error(data.error || "Something went wrong")
                }

                return data
            } catch (error) {
                throw new Error(error.message)
            }
        }
    })

    return (
        <>
            <Text mb={4} fontWeight={"bold"}>
                Suggested Users
            </Text>
            <Flex direction={"column"} gap={4}>
                {!isLoading && suggestedUsers.map(user => <SuggestedUser key={user._id} user={user}/>)}
                {!isLoading && suggestedUsers.length === 0 && <Flex>No suggested User to show</Flex>}

                {isLoading &&
                    [0, 1, 2, 3, 4].map((_, idx) => (
                        <Flex key={idx} gap={2} alignItems={"center"} p={"1"} borderRadius={"md"}>
                            {/* avatar skeleton */}
                            <Box>
                                <SkeletonCircle size={"10"} />
                            </Box>
                            {/* username and fullname skeleton */}
                            <Flex w={"full"} flexDirection={"column"} gap={2}>
                                <Skeleton h={"8px"} w={"80px"} />
                                <Skeleton h={"8px"} w={"90px"} />
                            </Flex>
                            {/* follow button skeleton */}
                            <Flex>
                                <Skeleton h={"20px"} w={"60px"} />
                            </Flex>
                        </Flex>
                    ))}
            </Flex>
        </>
    )
}

export default SuggestedUsers
