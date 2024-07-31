import { Button, Text } from '@chakra-ui/react';
import React from 'react'
import useConfirmationPopup from '../hooks/useConfirmationPopUp';
import { useMutation } from '@tanstack/react-query';
import useShowToast from '../hooks/useShowToast';
import useLogout from '../hooks/useLogout';

function SettingsPage() {
    const { ConfirmationModal, requestConfirm } = useConfirmationPopup()
    const showToast = useShowToast()

    const {mutate: logOut, isPending: isLoggingout} = useLogout()

    const { mutate: accountFrozen, isPending } = useMutation({
        mutationFn: async () => {
            try {
                const res = await fetch('/api/users/freeze', {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                })

                const data = await res.json()

                if (!res.ok) {
                    throw new Error(data.error || "Something went wrong")
                }

                logOut()
                return data;
            } catch (error) {
                throw new Error(error.message)
            }
        },
        onSuccess: () => {
            showToast("Success", "Account Freeze successfully", "success")
        },
        onError: (error) => {
            showToast("Error", error.message, "error")
        }
    })
    return (
        <>
            <Text my={1} fontWeight={"bold"}>
                Freeze Your Account
            </Text>
            <Text my={1}>You can unfreeze your account anytime by logging in. When you login its autometicly unfreeze you account</Text>
            <Button size={"sm"} colorScheme='red'
                onClick={() => requestConfirm(
                    'Are you sure you want to Freeze your Account',
                    'Yes, Freeze',
                    () => {
                        accountFrozen();
                        // After deletion, you might want to handle redirection or state update
                    },
                    'red',
                )}
                isLoading={isPending}
            >
                Freeze
            </Button >

            {ConfirmationModal}
        </>
    );
}

export default SettingsPage
