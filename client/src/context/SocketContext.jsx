import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useQuery } from "@tanstack/react-query";

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([])
    const { data: authUser } = useQuery({ queryKey: ['authUser'] });

    useEffect(() => {
        if (authUser) {
            const newSocket = io('/', {
                query: {
                    userId: authUser?._id,
                },
            });
            setSocket(newSocket);

            newSocket.on("getOnlineUsers", (users) => {
                setOnlineUsers(users)
            })
            return () => {
                newSocket.close();
            };
        }
    }, [authUser?._id]); // Only re-run when authUser changes

    console.log(onlineUsers, 'on');
    return (
        <SocketContext.Provider value={{ socket, onlineUsers }}>
            {children}
        </SocketContext.Provider>
    );
};
