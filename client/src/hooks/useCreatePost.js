import { useMutation, useQueryClient } from '@tanstack/react-query';
import useShowToast from './useShowToast';
import { useDisclosure } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';

const useCreatePost = () => {
    const queryClient = useQueryClient();
    const showToast = useShowToast()
    const { username } = useParams()

    return useMutation({
        mutationFn: async (userData) => {
            try {
                const res = await fetch("/api/posts/create", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(userData),
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
        onSuccess: (data) => {
            showToast("Success", "Post Created Successfully", "success")
            queryClient.invalidateQueries(['userPosts', username]);
        },
        onError: (error) => {
            showToast("Error", error.message, "error")
        },
    });
};

export default useCreatePost;
