import {useState, useRef, useEffect} from 'react';
import {io} from "socket.io-client";
import { listenForCommentNotification, listenForRatingNotfication, listenFormMessage} from '../sockets/socketListen';

//take user info from redux
const useSocket = (user) =>{

    const socketRef = useRef(null);
    const socket = socketRef.current;
    const [connected, setConnected] = useState(false);

    //on every useSocket will be this reRun
    // useEffect(()=>{
    //     if(user){
    //         //if is socket initializated
    //         if(socket !== null){
    //             console.log("socket.connect();")
    //             socket.connect();

    //             //message send to all users and user which id is in message obj should
    //             listenFormMessage(socket, user.userID);
    //             //listen only for comment that belongs to logged user
    //             listenForCommentNotification(socket, user.userID);
    //             listenForRatingNotfication(socket, user.userID);

    //         }
    //         else{
    //             const socketIn = io("http://127.0.0.1:5000", {
    //                 withCredentials: true,
    //             });
    //             socketRef.current = socketIn
    //             console.log("socketRef.current = socketIn")
    //         }
    //     setConnected(true);
    //     }   
    //     //userNotExxists (Not authorized)
    //     else{
    //         if(socket !== null){
    //             socket.disconnect();
    //             console.log("SOCKET DISCONNECTED")
    //             setConnected(false);
    //         }
    //     }

    //     return () => {
    //         // socket.disconnect();
            
    //       };

    // // },[socket,user]) //wont reacreate socket on change(socket)
    // },[user, socket]) 


    useEffect(()=>{
        if(user){
            //if is socket not initializated
            if(!socket){
                const socketIn = io("http://127.0.0.1:5000", {
                    withCredentials: true,
                });
                socketRef.current = socketIn
                console.log("socketRef.current = socketIn")

                socketIn.on("connect", () =>{
                    setConnected(true);
                    console.log("Socket Connected After Initial");

                    
                    // //in both situations set again listeners
                    // //message send to all users and user which id is in message obj should
                    // listenFormMessage(socketRef.current, user.userID);
                    // //listen only for comment that belongs to logged user
                    // listenForCommentNotification(socketRef.current, user.userID);
                    // listenForRatingNotfication(socketRef.current, user.userID);
                })

                socketIn.on("disconnect", ()=>{
                    setConnected(false);
                    console.log("Socket Disconnected");
                })

                
                //in both situations set again listeners
                //message send to all users and user which id is in message obj should
                listenFormMessage(socketRef.current, user.userID);
                //listen only for comment that belongs to logged user
                listenForCommentNotification(socketRef.current, user.userID);
                listenForRatingNotfication(socketRef.current, user.userID);

                // return() =>{
                //     socketIn.disconnect();
                //     console.log('socketIn.disconnect()');
                // }
            }
            else{
                // Reconnect the existing socket(when enter app and user is still authenticated)
                socket.connect();
                
                // //in both situations set again listeners
                // //message send to all users and user which id is in message obj should
                // listenFormMessage(socket, user.userID);
                // //listen only for comment that belongs to logged user
                // listenForCommentNotification(socket, user.userID);
                // listenForRatingNotfication(socket, user.userID);
                console.log("socket.connect() - Reconnected")
            }

            // setConnected(true);

            // return() =>{
            //     socket.disconnect();
            //     console.log('socketIn.disconnect();');
            // }
        }   
        //userNotExxists(Not authorized) and socket still esists
        else if (socketRef.current){
            socket.disconnect();
            console.log("socketRef.current.disconnect()");
        }   

    // },[socket,user]) //wont reacreate socket on change(socket)
    },[user]) 

    //return socketOBj, and connected State
    return [socket,connected];

}

export default useSocket