import {useState, useRef, useEffect} from 'react';
import {io} from "socket.io-client";
import { listenForCommentNotification, listenForRatingNotfication, listenFormMessage, listenOnCreateUserNotification, listenOnAddUserToGroupNotification, listenOnDeleteUserRoomNotification, listenOnKickUserFromGroupNotification} from '../sockets/socketListen';

//user info taken from redux
const useSocket = (user) =>{
    const socketRef = useRef(null);
    const [connected, setConnected] = useState(false);

    useEffect(() => {
        console.log("useSocket's useEFFECT");
        // Handle socket connection and disconnection based on user state
        if (user) {
            console.log("USSERRR : ", user);
          // Create a new socket instance if it doesn't exist
            if (!socketRef.current) {
                const socket = io('http://127.0.0.1:5000', { withCredentials: true });
                socketRef.current = socket;
                // console.log("SOCKET: ", socket); 
                //another approach useing socket.id isntead of user.id for emiting/listeninig events
            }

          // Connect and handle connection events
            socketRef.current.on('connect', () => {
                //this execute a little bit after the exercution (probably asyn think)
                console.log('Socket connected');
                setConnected(true);

                //register it as online user
                const userData ={userID:user.userID, userUsername:user.username}
                socketRef.current.emit('addOnlineUser', userData);

                // Emit join request for the user's room
                socketRef.current.emit('joinRoom', user.userID);
                console.log(`Joined room user-${user.userID}`);
            });
    
            // Handle disconnection events (optional)
            socketRef.current.on('disconnect', () => {
                //clean up function trigger this disconnect event
                console.log('Socket disconnected');
                setConnected(false);

                console.log("removeOnlineUser", user.userID);
                //unsubscribe it from onlineUserList
                socketRef.current.emit("removeOnlineUser", user.userID);

                socketRef.current.removeAllListeners(); // Remove all event listeners
                console.log("socketRef.current.removeAllListeners()")

                socketRef.current = null; // Clear the reference
                console.log("socketRef.current = null")
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
            listenFormMessage(socketRef.current, user.userID); // Listen for message notifications (both users)
            listenForCommentNotification(socketRef.current, user.userID); // Listen for comment notifications
            listenForRatingNotfication(socketRef.current, user.userID); // Listen for rating notifications
            listenOnCreateUserNotification(socketRef.current, user.userID); // Listen for create user notifications
            listenOnAddUserToGroupNotification(socketRef.current, user.userID);
            listenOnKickUserFromGroupNotification(socketRef.current, user.userID);
            listenOnDeleteUserRoomNotification(socketRef.current);

            // Clean up on unmount
            //logout will trigger this(redirectin to home trigger onMount component)
            return () => {
                if (socketRef.current) {
                    socketRef.current.disconnect(); // Disconnect the socket
                    console.log("socketRef.current.disconnect()");
                    // socketRef.current.removeAllListeners(); // Remove all event listeners
                    // console.log("socketRef.current.removeAllListeners()")
                }   
            };
        } else if (socketRef.current) { 
            //this executed then the seesion expired(user doesn't exist) but socketRef is still present
            // Disconnect socket if user is no longer present
            socketRef.current.disconnect();
            console.log(" socketRef.current.disconnect();")

            // socketRef.current = null; // Clear the reference
            // console.log("socketRef.current = null")
            // setConnected(false);
        }
      }, [user]);

    //return socketOBj, and connected State
    return [socketRef.current, connected];
}

export default useSocket