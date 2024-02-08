import {useState, useRef, useEffect} from 'react';
import {io} from "socket.io-client";
import { listenForCommentNotification, listenForRatingNotfication, listenFormMessage} from '../sockets/socketListen';

//take user info from redux
const useSocket = (user) =>{

    const socketRef = useRef(null);
    const socket = socketRef.current;
    const [connected, setConnected] = useState(false);

    //on every useSocket will be this reRun
    useEffect(()=>{
        if(user){
            //if is socket initializated
            if(socket !== null){
                console.log("socket.connect();")
                socket.connect();

                //message send to all users and user which id is in message obj should
                listenFormMessage(socket, user.userID);
                //listen only for comment that belongs to logged user
                listenForCommentNotification(socket, user.userID);
                listenForRatingNotfication(socket, user.userID);

            }
            else{
                const socketIn = io("http://127.0.0.1:5000", {
                    withCredentials: true,
                });
                socketRef.current = socketIn
                console.log("socketRef.current = socketIn")
            }
        setConnected(true);
        }   
        //userNotExxists (Not authorized)
        else{
            console.log("HHHEEEEEE ELSEEEEEEEEEE");
            if(socket !== null){
                console.log("socket.disconnect();")
                socket.disconnect();
            }
            // console.log("setConnected(false);")
        }

        // return () => {
        //     socket.disconnect();
        //   };

    },[socket,user])

    useEffect(()=>{

        if(connected && user){

        }
        else{
            if(socket){
                socket.off("user.connected");
                socket.off("message");
                socket.off("user.room");
            }
        }

    },[])


    //return socketOBj, and connected State
    return [socket,connected];

}

export default useSocket