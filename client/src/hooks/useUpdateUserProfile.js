import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import useShowToast from './useShowToast';
import { useNavigate } from 'react-router-dom';

const useUpdateUserProfile = (userId) => {
    const queryClient = useQueryClient();
    const {data: authUser} = useQuery({
        queryKey: ['authUser']
    })
    const showToast = useShowToast()
    const navigate = useNavigate()

    return useMutation({
        mutationFn: async (userData) => {
            try {
                console.log("userdata", userData);
                const res = await fetch(`/api/users/update/${userId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(userData),
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || "Something went wrong");
                }

                console.log("data", data);
                return data;
            } catch (error) {
                console.error(error);
                throw new Error(error.message);
            }
        },
        onSuccess: (data) => {
            showToast("Success", "Upadte User Profile Successfully", "success")
            queryClient.invalidateQueries(['authUser']);
            navigate(`/${data.username}`)
        },
        onError: (error) => {
            showToast("Error", error.message, "error")
        },
    });
};

export default useUpdateUserProfile
