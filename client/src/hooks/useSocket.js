import {useState, useRef, useEffect} from 'react';
import {io} from "socket.io-client";
import { listenForCommentNotification, listenForRatingNotfication, listenFormMessage, listenOnCreateUserNotification, listenOnAddUserToGroupNotification, listenOnDeleteUserRoomNotification, listenOnKickUserFromGroupNotification} from '../sockets/socketListen';
import {useDispatch} from 'react-redux';

//user info taken from redux
const useSocket = (user) =>{
    const socketRef = useRef(null);
    const reduxDispatch = useDispatch();
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        // Handle socket connection and disconnection based on user state
        if (user) {
            // Create a new socket instance if it doesn't exist
            if (!socketRef.current) {
                const socket = io('http://127.0.0.1:5000', { 
                    withCredentials: true, 
                    //Handshake
                    query: {userID: user.userID}  
                });
                socketRef.current = socket;
                // console.log("SOCKET: ", socket); 
                //another approach useing socket.id isntead of user.id for emiting/listeninig events
            }

            // Connect and handle connection events
            socketRef.current.on('connect', () => {
                //this execute a little bit after the exercution (probably asyn think)
                setConnected(true);

                //register it as online user
                const userData ={userID:user.userID, userUsername:user.username}
                socketRef.current.emit('addOnlineUser', userData);

                // Emit join request for the user's room
                socketRef.current.emit('joinRoom', user.userID);
            });
    
            // Handle disconnection events (optional)
            socketRef.current.on('disconnect', () => {
                //clean up function trigger this disconnect event
                setConnected(false);
                socketRef.current.removeAllListeners(); // Remove all event listeners
                socketRef.current = null; // Clear the reference

                // Clean up event listeners (optional)
                // socketRef.current.removeAllListeners(); // Uncomment if necessary
            });

            console.log("user.type: " , user.type);
             // if(user.type === "Houseworker"){
                //     listenForCommentNotification(socketRef.current);
                //     listenForRatingNotfication(socketRef.current, user.userID);
                //     listenOnCreateUserNotification(socketRef.current, user.userID);
                // }
    
            // Listeners for notifications (assuming separate functions for each)
            // listenFormMessage(socketRef.current, user.userID); // Listen for message notifications (both users)
            listenFormMessage(socketRef.current, reduxDispatch); // Listen for message notifications and update unreadCount with redux
            listenForCommentNotification(socketRef.current, reduxDispatch); // Listen for comment notifications
            listenForRatingNotfication(socketRef.current, user.userID, reduxDispatch); // Listen for rating notifications
            listenOnCreateUserNotification(socketRef.current, user.userID); // Listen for create user notifications
            listenOnAddUserToGroupNotification(socketRef.current, user.userID);
            listenOnKickUserFromGroupNotification(socketRef.current, user.userID);
            listenOnDeleteUserRoomNotification(socketRef.current);

            // Clean up on unmount
            //logout will trigger this(redirectin to home trigger onMount component)
            return () => {
                if (socketRef.current) {
                    socketRef.current.disconnect(); // Disconnect the socket
                    // socketRef.current.removeAllListeners(); // Remove all event listeners
                    // console.log("socketRef.current.removeAllListeners()")
                }   
            };
        } else if (socketRef.current) { 
            //this executed then the seesion expired(user doesn't exist) but socketRef is still present
            // Disconnect socket if user is no longer present
            socketRef.current.disconnect();
        }
      }, [user]);

    //return socketOBj, and connected State
    return [socketRef.current, connected];
}

export default useSocket