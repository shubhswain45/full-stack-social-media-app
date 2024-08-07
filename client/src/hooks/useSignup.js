import { useMutation, useQueryClient } from '@tanstack/react-query';
import useShowToast from './useShowToast';

const useSignup = () => {
    const queryClient = useQueryClient();
    const showToast = useShowToast()

    return useMutation({
        mutationFn: async (userData) => {
            try {
                const res = await fetch("/api/users/signup", {
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
            // Optionally invalidate queries or set data in query cache
            showToast("Success", "Account Created Successfully", "success")
            queryClient.invalidateQueries(['authUser']);
        },
        onError: (error) => {
            showToast("Error", error.message, "error")
        },
    });
};

export default useSignup;
