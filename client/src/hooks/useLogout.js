import { useMutation, useQueryClient } from '@tanstack/react-query';
import useShowToast from './useShowToast';
import { useselectedConversation } from '../context/selectedConversationContext';

const useLogout = () => {
    const queryClient = useQueryClient();
    const showToast = useShowToast();
    const { selectedConversation, setSelectedConversation } = useselectedConversation();

    return useMutation({
        mutationFn: async () => {
            try {
                const res = await fetch("/api/users/logout", {
                    method: "POST",
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
            // Clear TanStack Query cache
            queryClient.setQueryData(['authUser'], () => null)
            queryClient.clear();
            setSelectedConversation(null)
            // If you want to specifically invalidate queries, you can do it here
            // queryClient.invalidateQueries(['authUser']);
            showToast("Success", "Logged out successfully", "success");
        },
        onError: (error) => {
            showToast("Error", error.message, "error");
        },
    });
};

export default useLogout;
