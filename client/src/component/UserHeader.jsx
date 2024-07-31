import { Avatar } from "@chakra-ui/avatar";
import { Box, Flex, Text, VStack } from "@chakra-ui/layout";
import { Button } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import useFollowUnfollow from "../hooks/useFollowUnfollow";

const UserHeader = ({ userProfile }) => {
	const { data: authUser } = useQuery({ queryKey: ['authUser'] })
	const { mutate: followUnfollowUser, isPending } = useFollowUnfollow()

	const alreadyFollowing = userProfile.followers.includes(authUser?._id)
	const [isZoomed, setIsZoomed] = useState(false);

	const handleAvatarClick = () => {
		setIsZoomed(!isZoomed);
	};

	return (
		<VStack gap={4} alignItems="start">
			<Flex justifyContent="space-between" w="full">
				<Box>
					<Text fontSize="2xl" fontWeight="bold">
						{userProfile.name}
					</Text>
					<Flex gap={2} alignItems="center">
						<Text fontSize="sm">{userProfile.username}</Text>
						<Text
							fontSize="xs"
							bg="gray.dark"
							color="gray.light"
							p={1}
							borderRadius="full"
						>
							mingleverse.net
						</Text>
					</Flex>
				</Box>
				<Box
					onClick={userProfile.profilePic !== '' ? handleAvatarClick : undefined}
					cursor="pointer"
					position="relative"
					overflow="hidden"
					borderRadius="full"
					boxShadow={isZoomed ? "0 0 20px rgba(0,0,0,0.3)" : "none"}
					transition="box-shadow 0.3s ease"
				>
					<Avatar
						src={userProfile.profilePic || "https://thumbs.dreamstime.com/b/default-avatar-profile-flat-icon-social-media-user-vector-portrait-unknown-human-image-default-avatar-profile-flat-icon-184330869.jpg"}
						size={{ base: "xl", md: "2xl" }}
						transform={isZoomed ? "scale(1.2)" : "scale(1)"}
					/>
				</Box>
			</Flex>

			<Flex mt={{ base: "-30px", md: "-60px" }}>
				<Text>{userProfile.bio}</Text>
			</Flex>

			{
				authUser?._id.toString() === userProfile._id.toString() && (
					<Link to={'/update'}>
						<Button size={'sm'}>Update Profile</Button>
					</Link>
				)
			}

			{
				authUser?._id.toString() !== userProfile._id.toString() && (
					<Button size={'sm'} isLoading={isPending} onClick={() => followUnfollowUser(userProfile._id)}>{alreadyFollowing ? "Unfollow" : "Follow"}</Button>
				)
			}

			<Flex w="full" justifyContent="space-between">
				<Flex gap={2} alignItems="center">
					<Text>{userProfile.followers.length} followers</Text>
					<Box w="1" h="1" bg="gray.light" borderRadius="full"></Box>
					<Text>{userProfile.following.length} following</Text>
				</Flex>
				<Flex>
					{/* Add your other icons or actions here */}
				</Flex>
			</Flex>

			<Flex w="full">
				<Flex
					flex={1}
					borderBottom="1.5px solid white"
					justifyContent="center"
					pb="3"
					cursor="pointer"
				>
					<Text fontWeight="bold">Threads</Text>
				</Flex>
				<Flex
					flex={1}
					justifyContent="center"
					pb="3"
					cursor="pointer"
				>
					<Text fontWeight="bold">Replies</Text>
				</Flex>
			</Flex>
		</VStack>
	);
};

export default UserHeader;
