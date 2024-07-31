import React, { useState } from 'react';
import { Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure, useColorModeValue } from '@chakra-ui/react';
import useLogout from '../hooks/useLogout';
import useConfirmationPopup from '../hooks/useConfirmationPopUp';

function LogoutButton() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { mutate: logoutUser, isPending } = useLogout();
    const { ConfirmationModal, requestConfirm } = useConfirmationPopup();

    return (
        <>
            <Button
                position={"fixed"}
                top={"30px"}
                right={"30px"}
                size={"sm"}
                isLoading={isPending}
                onClick={(e) => {
                    e.preventDefault();
                    requestConfirm(
                        'Are you sure you want to Logout ?',
                        'Yes, Logout',
                        () => {
                            logoutUser();
                            // After deletion, you might want to handle redirection or state update
                        },
                        'blue'
                    );
                }}
            >
                Logout
            </Button>
            {ConfirmationModal}
        </>
    );
}

export default LogoutButton;
