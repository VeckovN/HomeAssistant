import {useState, useRef, useEffect} from 'react';
import {io} from "socket.io-client";
import {listenForCommentNotification, listenForRatingNotfication, listenFormMessage, listenOnCreateUserNotification, listenOnAddUserToGroupNotification, listenOnDeleteUserRoomNotification, listenOnKickUserFromGroupNotification} from '../sockets/socketListen';
import {useDispatch} from 'react-redux';

const useSocket = (user) =>{
    const socketRef = useRef(null);
    const reduxDispatch = useDispatch();
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        if (user) {
            // Create a new socket instance if it doesn't exist
            if (!socketRef.current) {
                const socket = io('http://127.0.0.1:5000', { 
                    withCredentials: true, 
                    //Handshake
                    query: {userID: user.userID}   
                });
                socketRef.current = socket;
            }

            socketRef.current.on('connect', () => {
                setConnected(true);
                const userData ={userID:user.userID, userUsername:user.username}
                socketRef.current.emit('addOnlineUser', userData);
                socketRef.current.emit('joinRoom', user.userID);
            });
    
            socketRef.current.on('disconnect', () => {
                setConnected(false);
                socketRef.current.removeAllListeners();
                socketRef.current = null;
            });

            if(user.type === "Houseworker"){
                listenForCommentNotification(socketRef.current, reduxDispatch); 
                listenForRatingNotfication(socketRef.current, user.userID, reduxDispatch); 
                listenOnCreateUserNotification(socketRef.current, reduxDispatch); 
                listenOnDeleteUserRoomNotification(socketRef.current, reduxDispatch);
                listenOnAddUserToGroupNotification(socketRef.current, reduxDispatch);
                listenOnKickUserFromGroupNotification(socketRef.current, user.userID, reduxDispatch);
            }
                listenFormMessage(socketRef.current, reduxDispatch); //Listen for message notifications (both users)
            
               
            return () => {
                if (socketRef.current) {
                    socketRef.current.disconnect(); 
                }   
            };
        } else if (socketRef.current) { 
            // Disconnect socket if user is no longer present
            socketRef.current.disconnect();
        }
      }, [user]);

    return [socketRef.current, connected];
}

export default useSocket