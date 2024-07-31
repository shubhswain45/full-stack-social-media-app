import { useMutation, useQueryClient } from '@tanstack/react-query';
import useShowToast from './useShowToast';
import { useParams } from 'react-router-dom';

const useFollowUnfollow = () => {
    const queryClient = useQueryClient();
    const showToast = useShowToast()
    const {username} = useParams()

    return useMutation({
        mutationFn: async (userId) => {
            try {
                const res = await fetch(`/api/users/follow/${userId}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    }
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
            // Optionally invalidate queries or set data in query cache
            queryClient.invalidateQueries(['userProfile', username]);
            queryClient.invalidateQueries(['feedPosts']);
        },
        onError: (error) => {
            showToast("Error", error.message, "error")
        },
    });
};

export default useFollowUnfollow;
