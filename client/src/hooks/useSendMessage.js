import { useMutation, useQueryClient } from '@tanstack/react-query';
import useShowToast from './useShowToast';
import { useselectedConversation } from '../context/selectedConversationContext';
import { useQuery } from '@chakra-ui/react';

const useSendMessage = () => {
    const queryClient = useQueryClient();
    const showToast = useShowToast();
    const authUser = queryClient.getQueryData(['authUser'])

    const { selectedConversation } = useselectedConversation();

    return useMutation({
        mutationFn: async ({ message, recipientId, img }) => {
            try {
                const res = await fetch("/api/messages", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ message, recipientId, img }),
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
            // Update messages cache
            queryClient.setQueryData(['messages', selectedConversation._id], (oldData = []) => {
                return [...oldData, data];
            });

            queryClient.setQueryData(['conversations'], (oldData = []) => {
                const updatedConversation = oldData.map(conversation => {
                    if (selectedConversation._id === conversation._id) {
                        return {
                            ...conversation,
                            lastMessage: {
                                sender: data.sender,
                                sendingTime: data.createdAt,
                                text: data.text || "Send a photo",
                                seen: false
                            }
                        };
                    }
                    return conversation;
                });
                return updatedConversation.sort((a, b) => new Date(b.lastMessage.sendingTime) - new Date(a.lastMessage.sendingTime))
            });
        },
        onError: (error) => {
            showToast("Error", error.message, "error");
        },
    });
};

export default useSendMessage;
