import { Button, Flex, Input, InputGroup, InputRightElement, Icon, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, Image, Spinner, useDisclosure, useColorModeValue } from '@chakra-ui/react';
import { useMutation } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { BsFillImageFill } from 'react-icons/bs';
import { IoSendSharp } from 'react-icons/io5';
import useSendMessage from '../hooks/useSendMessage';
import { useselectedConversation } from '../context/selectedConversationContext';
import { useRef } from 'react';
import usePreviewImg from '../hooks/usePreviewImg';

function MessageInput() {
	const { mutate: sendMessage, isPending, isSuccess } = useSendMessage();
	const [messageText, setMessageText] = useState('');
	const { selectedConversation } = useselectedConversation();

	const { onClose } = useDisclosure();

	const { handleImageChange, imgUrl, setImgUrl } = usePreviewImg();

	const imageRef = useRef(null)
	const handleSendMessage = () => {
		if(!messageText && !imgUrl) return;
		sendMessage({ recipientId: selectedConversation.userId, message: messageText, img: imgUrl });
	};

	useEffect(() => {
		if (isSuccess) {
			setMessageText('')
			setImgUrl('')
		}
	}, [isSuccess])

	return (
		<Flex gap={2} alignItems={"center"}>
			<form style={{ flex: 95 }} onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}>
				<InputGroup>
					<Input
						w={"full"}
						placeholder='Type a message'
						onChange={(e) => setMessageText(e.target.value)}
						value={messageText}
					/>
					<InputRightElement>
						<Button
							size="sm"
							isLoading={isPending}
							onClick={handleSendMessage}
							variant="ghost"
						>
							<Icon as={IoSendSharp} />
						</Button>
					</InputRightElement>
				</InputGroup>
			</form>
			<Flex flex={5} cursor={"pointer"}>
				<BsFillImageFill size={20} onClick={() => imageRef.current.click()} />
				<Input type={"file"} hidden ref={imageRef} onChange={handleImageChange} />
			</Flex>

			<Modal
				isOpen={imgUrl}
				onClose={() => {
					onClose();
					setImgUrl("");
				}}
			>
				<ModalOverlay />
				<ModalContent bg={useColorModeValue("white", "gray.dark")}>
					<ModalHeader></ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<Flex mt={5} w={"full"}>
							<Image src={imgUrl} />
						</Flex>
						<Flex justifyContent={"flex-end"} my={2}>
							{true ? (
								<Button
									size="sm"
									isLoading={isPending}
									onClick={handleSendMessage}
									variant="ghost"
								>
									<Icon as={IoSendSharp} />
								</Button>
							) : (
							<Spinner size={"md"} />
							)}
						</Flex>
					</ModalBody>
				</ModalContent>
			</Modal>
		</Flex>
	);
}

export default MessageInput;
