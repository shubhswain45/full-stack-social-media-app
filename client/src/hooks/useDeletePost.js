import { useMutation, useQueryClient } from '@tanstack/react-query';
import useShowToast from './useShowToast';
import { useParams } from 'react-router-dom';

const useDeletePost = () => {
    const queryClient = useQueryClient();
    const showToast = useShowToast()
    const { username } = useParams()

    return useMutation({
        mutationFn: async (postId) => {
            try {
                const res = await fetch(`/api/posts/${postId}`, {
                    method: "DELETE",
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
            showToast("Success", "Post Deleted Successfully", "success")
            queryClient.invalidateQueries(['userPosts', username]);
        },
        onError: (error) => {
            showToast("Error", error.message, "error")
        },
    });
};

export default useDeletePost;
