import {
    Flex,
    Box,
    FormControl,
    FormLabel,
    Input,
    InputGroup,
    InputRightElement,
    Stack,
    Button,
    Heading,
    Text,
    useColorModeValue,
    Link,
} from "@chakra-ui/react";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from "../context/authContext";
import useLogin from "../hooks/useLogin";

export default function LoginForm() {
    const {mutate: loginUser, isPending} = useLogin()
    const {setAuthState} = useAuth()
    const [showPassword, setShowPassword] = useState(false);
    const [inputs, setInputs] = useState({
        username: "",
        password: "",
    });

    return (
        <Flex align={"center"} justify={"center"}>
            <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
                <Stack align={"center"}>
                    <Heading fontSize={"4xl"} textAlign={"center"}>
                        Login
                    </Heading>
                </Stack>
                <Box
                    rounded={"lg"}
                    bg={useColorModeValue("white", "gray.dark")}
                    boxShadow={"lg"}
                    p={8}
                    w={{
                        base: "full",
                        sm: "400px",
                    }}
                >
                    <Stack spacing={4}>
                        <FormControl isRequired>
                            <FormLabel>Username</FormLabel>
                            <Input
                                type='text'
                                value={inputs.username}
                                onChange={(e) => setInputs((inputs) => ({ ...inputs, username: e.target.value }))}
                            />
                        </FormControl>
                        <FormControl isRequired>
                            <FormLabel>Password</FormLabel>
                            <InputGroup>
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    value={inputs.password}
                                    onChange={(e) => setInputs((inputs) => ({ ...inputs, password: e.target.value }))}
                                />
                                <InputRightElement h={"full"}>
                                    <Button
                                        variant={"ghost"}
                                        onClick={() => setShowPassword((showPassword) => !showPassword)}
                                    >
                                        {showPassword ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
                                    </Button>
                                </InputRightElement>
                            </InputGroup>
                        </FormControl>
                        <Stack spacing={10} pt={2}>
                            <Button
                                loadingText='Logging in'
                                size='lg'
                                bg={useColorModeValue("gray.600", "gray.700")}
                                color={"white"}
                                _hover={{
                                    bg: useColorModeValue("gray.700", "gray.800"),
                                }}
                                onClick={() => loginUser(inputs)}
                                isLoading={isPending}
                            >
                                Login
                            </Button>
                        </Stack>
                        <Stack pt={6}>
                            <Text align={"center"}>
                                Don&apos;t have an account?{" "}
                                <Link color={"blue.400"} onClick={() => setAuthState('singup')}>
                                    Sign up
                                </Link>
                            </Text>
                        </Stack>
                    </Stack>
                </Box>
            </Stack>
        </Flex>
    );
}
