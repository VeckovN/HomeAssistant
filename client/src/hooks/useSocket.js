import {useState, useRef, useEffect} from 'react';
import {io} from "socket.io-client";
import { listenForCommentNotification, listenForRatingNotfication, listenFormMessage, listenOnCreateUserNotification} from '../sockets/socketListen';

//user info taken from redux
const useSocket = (user) =>{
    const socketRef = useRef(null);
    const socket = socketRef.current;
    const [connected, setConnected] = useState(false);

    useEffect(()=>{
        if(user){
            if(!socket){
                const socketIn = io("http://127.0.0.1:5000", {
                    withCredentials: true,
                });
                socketRef.current = socketIn
                console.log("socketRef.current = socketIn")

                socketIn.on("connect", () =>{
                    setConnected(true);
                    //emit userID to joinRoom that ectualy joining the (user-${userID} room)
                    socketIn.emit("joinRoom", user.userID);
                    console.log("Socket Connected After Initial");
                })

                socketIn.on("disconnect", ()=>{
                    // socketRef.current.off('messageResponseNotify');
                    // socketRef.current.off(`privateCommentNotify-${user.userID}`);
                    // socketRef.current.off(`privateRatingNotify-${user.userID}`);
                    // socketRef.current.off(`createUserToGroupNotify-${user.userID}`);
                    socketIn.off('messageResponseNotify');
                    socketIn.off(`privateCommentNotify-${user.userID}`);
                    socketIn.off(`privateRatingNotify-${user.userID}`);
                    socketIn.off(`createUserToGroupNotify-${user.userID}`);

                    socketIn.emit("leaveRoom", user.userID);
                    console.log(`emit("leaveRoom", ${user.userID})`);

                    // socketRef.current.removeAllListener();
                    socketRef.current = null;
                    setConnected(false);
                })

                //LIsteners for Houseworkers - Clients can't got the rate, comment and addUserToGroup notifications
                // if(user.type === "Houseworker"){
                //     listenForCommentNotification(socketRef.current);
                //     listenForRatingNotfication(socketRef.current, user.userID);
                //     listenOnCreateUserNotification(socketRef.current, user.userID);
                // }

                //in both situations set again listeners
                //message send to all users and user which id is in message obj should
                listenFormMessage(socketRef.current, user.userID);
                // listenForCommentNotification(socketRef.current, user.userID);
                listenForCommentNotification(socketRef.current);
                listenForRatingNotfication(socketRef.current, user.userID);
                listenOnCreateUserNotification(socketRef.current, user.userID);
            }
            else{
                socket.connect();
                listenFormMessage(socketRef.current, user.userID);
                listenForCommentNotification(socketRef.current, user.userID);
                listenForRatingNotfication(socketRef.current, user.userID);
                listenOnCreateUserNotification(socketRef.current, user.userID);
                console.log("socket.connect() - Reconnected")
            }
        }   
        //Whne user not exist or user loggout
        else if (socketRef.current){ 
            socket.disconnect();
        }   

        return () => {
            if (socket) {
                socket.disconnect();
            }
          };

    },[user]) 

    //return socketOBj, and connected State
    return [socket,connected];
}

export default useSocket