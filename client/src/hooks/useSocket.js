import {useState, useRef, useEffect} from 'react';
import {io} from "socket.io-client";
import { toast } from 'react-toastify';

//take user info from redux
const useSocket = (user) =>{

    const socketRef = useRef(null);
    const socket = socketRef.current;
    const [connected, setConnected] = useState(false);

    //on every useSocket will be this reRun
    useEffect(()=>{
        console.log("US: " + JSON.stringify(user));
        console.log("SS: " + user);
        console.log("S@: " + !user );
        if(user){
            //if is socket initializated
            if(socket !== null){
                console.log("socket.connect();")
                socket.connect();

                //because in Nodejs socket.on("message", async(messageObj)=>{ 
                //there is async and this function expect promise
                socket.on("messageResponseNotify", (messageObj) =>{
                    console.log(messageObj);
                    const parsedObj = JSON.parse(messageObj);
                    const { message, from, roomID, fromUsername} = parsedObj;
                    const users = roomID.split(':');

                    //exclude sender from users notification
                    const notifyUsers = users.filter(el => el!=from);

                    //if our userID is in array of notifyUsers
                    // if(users.includes(user.userID)){
                    if(notifyUsers.includes(user.userID)){
                        toast.info(`You received Message from ${fromUsername}`,{
                            className:"toast-contact-message"
                        })
                    }

                  })
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
        // else{
        //     console.log("HHHEEEEEE ELSEEEEEEEEEE");
        //     if(socket !== null){
        //         console.log("socket.disconnect();")
        //         socket.disconnect();
        //     }
        //     console.log("setConnected(false);")
        // }



    },[socket,user])


    //socket event listeners

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