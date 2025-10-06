import {useState, useRef, useEffect} from 'react';
import {io} from "socket.io-client";
import {listenForCommentNotification, listenForRatingNotfication, listenFormMessage, listenOnCreateUserNotification, listenOnAddUserToGroupNotification, listenOnDeleteUserRoomNotification, listenOnKickUserFromGroupNotification} from '../sockets/socketListen';
import {useDispatch, useSelector} from 'react-redux';

const SOCKET_URL =
  process.env.NODE_ENV === "production"
    ? "https://homeassistant-ed5z.onrender.com"
    : "http://127.0.0.1:5000";

const useSocket = (user) =>{
    const socketRef = useRef(null);
    const currentRoomIDRef = useRef(null);
    const reduxDispatch = useDispatch();
    const [connected, setConnected] = useState(false);

    const currentRoomID = useSelector((state) => state.currentRoom?.currentRoomID);

    //send new fetched currentRoomID to listenFormMessage listener
    useEffect(() =>{
        currentRoomIDRef.current = currentRoomID;
    }, [currentRoomID])

    useEffect(() => {
        if (user) {
            if (!socketRef.current) {
                const socket = io(SOCKET_URL, { 
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
            
            listenFormMessage(socketRef.current, reduxDispatch, () => currentRoomIDRef.current); //Listen for message notifications (both users)
            
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