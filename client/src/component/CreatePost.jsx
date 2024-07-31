// import { AddIcon } from "@chakra-ui/icons";
import {
    Button,
    CloseButton,
    Flex,
    FormControl,
    Image,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Text,
    Textarea,
    useColorModeValue,
    useDisclosure,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";

import { BsFillImageFill } from "react-icons/bs";
import { FaPlus } from "react-icons/fa";
import usePreviewImg from "../hooks/usePreviewImg";
import useCreatePost from "../hooks/useCreatePost";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

const MAX_CHAR = 500;

const CreatePost = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [postText, setPostText] = useState('')
    
    const { handleImageChange, imgUrl, setImgUrl } = usePreviewImg()

    const { mutate: createPost, isPending, isSuccess } = useCreatePost()
    const { data: authUser } = useQuery({ queryKey: ['authUser'] })

    const imageRef = useRef(null)
    const [remainingChar, setRemainingChar] = useState(MAX_CHAR);

    const handleTextChange = (e) => {
        const inputText = e.target.value;

        if (inputText.length > MAX_CHAR) {
            const truncatedText = inputText.slice(0, MAX_CHAR);
            setPostText(truncatedText);
            setRemainingChar(0);
        } else {
            setPostText(inputText);
            setRemainingChar(MAX_CHAR - inputText.length);
        }
    };

    const handlePostImg = () => {
        if (isPending) return;
        createPost({ postedBy: authUser._id, text: postText, img: imgUrl })
    }

    // For close the model window if the post created successfully then we'il close that model
    useEffect(() => {
        if (isSuccess) onClose()
    }, [isSuccess])

    return (
        <>
            <Button
                position={"fixed"}
                bottom={10}
                right={5}
                bg={useColorModeValue("gray.300", "gray.dark")}
                onClick={onOpen}
                size={{ base: "sm", sm: "md" }}
            >
                <FaPlus />
            </Button>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />

                <ModalContent bg={useColorModeValue("white", "gray.dark")}>
                    <ModalHeader>Create Post</ModalHeader>
                    <ModalCloseButton onClick={() => { setPostText(''), setImgUrl(null) }} />
                    <ModalBody pb={6}>
                        <FormControl>
                            <Textarea
                                placeholder='Post content goes here..'
                                onChange={handleTextChange}
                                value={postText}
                            />
                            <Text fontSize='xs' fontWeight='bold' textAlign={"right"} m={"1"} color={"white.400"}>
                                {remainingChar}/{MAX_CHAR}
                            </Text>

                            <Input type='file' hidden ref={imageRef} onChange={handleImageChange} />

                            <BsFillImageFill
                                style={{ marginLeft: "5px", cursor: "pointer" }}
                                size={16}
                                onClick={() => imageRef.current.click()}
                            />
                        </FormControl>

                        {imgUrl && (
                            <Flex mt={5} w={"full"} position={"relative"}>
                                <Image src={imgUrl} alt='Selected img' />
                                <CloseButton
                                    onClick={() => {
                                        setImgUrl("");
                                    }}
                                    bg={"gray.800"}
                                    position={"absolute"}
                                    top={2}
                                    right={2}
                                />
                            </Flex>
                        )}

                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme='blue' mr={3} onClick={handlePostImg}>
                            {isPending ? "Posting..." : "Post"}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default CreatePost;