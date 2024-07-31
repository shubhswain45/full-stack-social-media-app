import { useToast } from '@chakra-ui/react';
import { useCallback } from 'react';

function useShowToast() {
    const toast = useToast();

    // Wrap the toast function in useCallback to memoize it
    const showToast = useCallback((title, description, status, duration = 4000) => {
        toast({
            title,
            description,
            status,
            duration,
            isClosable: true,
        });
    }, [toast]);

    return showToast;
}

export default useShowToast;
