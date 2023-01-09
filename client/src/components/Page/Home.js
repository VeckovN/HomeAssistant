import { ReactFragment } from "react";
import { Router } from "react-router-dom";
import ClientHome from "./Client/ClientHome.js";
import HouseworkerHome from './Houseworker/HouseworkerHome';
import {Routes, Route} from 'react-router-dom';
import {useSelector} from 'react-redux';


//CLIENT - Serach, Filter, HouseworkersCard(wiht paggination)
//GUEST sees everything just like THE CLIENT but 
// -can't see all information(Working hours, Rating) and cant send message and post comment
//HOUSEWORKER - Has own view, GeneralMessage, shortcuts(Cards) to view Messages,Comments and Ratings. 


//if there isn't type then is 100% Guest
//type=['client','houseworker']
const Home = () =>{

    const userAuth = useSelector((state) => state.auth) //null when not exists
    // const authUser = user.username ? true : false;
    // let client;
    // if(user.user)
    //     client = userAuth.user.type === 'Client' ? true : false;
    console.log("SSSSSSSSSSSSSSS: " + JSON.stringify(userAuth));
    
    if(userAuth.user === null)
        console.log("TESSSSSSSSS");

    let client;
    if(userAuth.user)
        client = userAuth.user.type === 'Client' ? true : false;


    //console.log("CHECL  " + JSON.stringify(authUser))

   
    return (
        <div>
            {/* Guest sees same as Client but with limitation(can't see all infos and send messages,comments) */}
            {/* {type=='client' || type=='undefined' && <ClientHome />}
            {type=='houseworker' && <HouseworkerHome/>} */}
            {/* <ClientHome/> */}

            {/* SHOW ClientHome if is guest or client */}
            <Routes>
                <Route
                    path='/'
                    element ={
                        //client or guest(if is user null)
                        client || userAuth.user===null
                        // in ClientHome limit what Guest can do and see
                        ? <ClientHome /> 
                        // If is authenticated as Houseworker 
                        : <HouseworkerHome/>
                    }
                />
            </Routes>

            

        </div>
    )
}


export default Home;
