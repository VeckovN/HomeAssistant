import { ReactFragment, useEffect } from "react";
import { Router } from "react-router-dom";
import ClientHome from "./Client/Home/ClientHome.js";
import HouseworkerHome from './Houseworker/HouseworkerHome';
import {Routes, Route} from 'react-router-dom';
import {useSelector} from 'react-redux';
import {toast} from 'react-toastify';
import useSocket from '../../hooks/useSocket';

import Cookie from 'js-cookie';


//CLIENT - Serach, Filter, HouseworkersCard(wiht paggination)
//GUEST sees everything just like THE CLIENT but 
// -can't see all information(Working hours, Rating) and cant send message and post comment
//HOUSEWORKER - Has own view, GeneralMessage, shortcuts(Cards) to view Messages,Comments and Ratings. 


//if there isn't type then is 100% Guest
//type=['client','houseworker']
const Home = ({socket, connected, user}) =>{
    // const coo = Cookie.get("sessionLog");

    // const userAuth = useSelector((state) => state.auth) 
    // if(userAuth.user === null)
    //     console.log("TESSSSSSSSS");

    if(user === null)
        console.log("TESSSSSSSS");

    let client;
    // if(userAuth.user)
    //     client = userAuth.user.type === 'Client' ? true : false;

    if(user)
        client = user.type === 'Client' ? true : false;
    //Message Receive Notification

    console.log("JSON STT USER: " + JSON.stringify(user));

    useEffect(()=>{
        //if(connected && userAuth.user){
        if(connected && user){
            console.log("NOTIIIIIIIFYU")
            socket.on("messageResponseNotify", data =>{
                const dataObj = JSON.parse(data);
                console.log("message");
                //not show yourself
                // if(userAuth.user.userRedisID != dataObj.from)
                if(user.userID != dataObj.from)
                {
                    // console.log("WEE E " + JSON.stringify(userAuth.user))
                    // console.log('WE ' + userAuth.user.userRedisID)
                    console.log("WEE E " + JSON.stringify(user))
                    console.log('WE ' + user.userID)
                    const roomIDs = dataObj.roomID
                    const rooms = roomIDs.split(':'); //indexes [0][1]
                    console.log("ROMSSSSS: " + JSON.stringify(rooms));
                    //show only members of message room(Are ourID is in RoomID)
                    // console.log(">?> : " + rooms.includes(userAuth.user.userRedisID));
                    // if(rooms.includes(userAuth.user.userRedisID))
                    console.log(">?> : " + rooms.includes(user.userID));
                    if(rooms.includes(user.userID))
                    {
                        console.log("Received message");
                        //find username by userID
                        //const receivedFrom = await getUsernameByUserID(data.from)
                        // toast.info("You received message from :" + receivedFrom);
                        toast.info("Stigla je poruka od :" + dataObj.fromUsername);
                    }
                }
                
            })
            socket.on("commentResponseNotify", data =>{
                const commentObj = JSON.parse(data);
                const houseworkerID  =commentObj.houseworkerID;
                const clientCommented = commentObj.client;

                // if(userAuth.user.userRedisID == houseworkerID){
                if(user.userID == houseworkerID){
                    console.log("HEEEEEE");
                    toast.info("Dobio si komentar od " + clientCommented)
                }
            })
        }
    // },[socket, userAuth.user])
    },[socket, user])
    
   
    return (
        <div>
            {/* SHOW ClientHome if is guest or client */}
            <Routes>
                <Route
                    path='/'
                    element ={
                        //client or guest(if is user null)
                        // client || userAuth.user===null
                        client || user===null
                        // in ClientHome limit what Guest can do and see
                        ? <ClientHome socket={socket} /> 
                        // If is authenticated as Houseworker 
                        : <HouseworkerHome/>
                    }
                />
            </Routes>
        </div>
    )
}


export default Home;
