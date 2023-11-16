import {useEffect, useRef, useReducer, useState} from 'react'; 
import { useSelector } from 'react-redux';
import Chat from './Chat/Chat.js';
import Rooms from './Rooms/Rooms.js';
import { toast } from 'react-toastify';
import { MessagesReducer } from './MessagesReducer.js';
import {getHouseworkers} from '../../../services/houseworker.js';
import { listenOnMessageInRoom } from '../../../sockets/socketListen.js';
import { emitRoomJoin, emitLeaveRoom } from '../../../sockets/socketEmit.js';
import {getUserRooms, deleteRoom, addUserToRoom, getMessagesByRoomID} from '../../../services/chat.js';
import Spinner from '../../UI/Spinner.js';

import '../../../sass/pages/_messages.scss';

//@TODO = ADD button on Houseworker Card for addding this user in some chat
//@TODO = Add Search form for searching for houseworker which you want to add in chat 
//instead fetching all houseworkers and list them

const Messages = ({socket,connected}) =>{

    const {user} = useSelector((state) => state.auth)

    const initialState = {
        loading:true,
        rooms:[],
        roomMessages: [],
        houseworkers:'',
        enteredRoomID:''
    }

    const roomRef = useRef(); //value(roomID) of showned room
    const [state, dispatch] = useReducer(MessagesReducer, initialState);

    useEffect(() => {
            if(connected && user){
                console.log("HEEEEEEEEE");
                //io.to(roomKey).emit("messageRoom", messageObj)
                //users which looking on chat will  receive message 
                listenOnMessageInRoom(socket, dispatch);
    
                //when is created new room show it with others
                socket.on('show.room', (room) =>{
                    
                })
            }
        },[socket]) //on socket change (SOCKET WILL CHANGE WHEN IS MESSAGE SEND --- socket.emit)
    
        const fetchAllRooms = async () =>{   
            const data = await getUserRooms(user.username);
            dispatch({type:"SET_ROOMS", data:data})
            console.log('DATA ROOMS : \n' + JSON.stringify(data));
            dispatch({type:"SET_LOADING", payload:false})
        }

        const getAllHouseworkers = async() =>{
            const houseworkerResult = await getHouseworkers();
            dispatch({type:"SET_HOUSEWORKERS", data:houseworkerResult});
        }
    
        //onClick username read messages from him(from roomID where is it )
        const onRoomClickHanlder = async e =>{
            const roomID = e.target.value;
            //Assing clicked roomID to roomRef (read roomID valuewiht roomRef.current.value)
            roomRef.current = e.target;
            if(state.enteredRoomID !='' && state.enteredRoomID != roomID){
                //socket.emit('leave.room', state.enteredRoomID);
                emitLeaveRoom(socket, state.enteredRoomID);
                console.log("leave.room : " + state.enteredRoomID);
            }

            emitRoomJoin(socket, roomID);
            console.log("JOIN ROOM: " + roomRef.current.value + "    ROOM ID " + roomID);

            dispatch({type:"SET_ENTERED_ROOM_ID", data:roomID})
            
            //MUST PARSE TO JSON BECASE WE GOT MESSAGES AS STRING JSON
            const messages = await getMessagesByRoomID(roomID)
            dispatch({type:"SET_ROOM_MESSAGES", data:messages})
        }
    
        const onDeleteRoomHandler = async(e)=>{ 
            const roomID = e.target.value;

            try{
                await deleteRoom(roomID);
                dispatch({type:"DELETE_ROOM", data:roomID});
    
                toast.success("You have successfully deleted the room",{
                    className:"toast-contact-message"
                });
            }
            catch(error){
                //catch error from service
                console.error(error);
                toast.error("The room can't be deleted",{
                    className:"toast-contact-message"
                });
            }
        }

        useEffect(() =>{
            fetchAllRooms()
            getAllHouseworkers();
        },[])
    
        const onAddUserToGroupHanlder = async(roomID, username)=>{
            if(username == ""){
                toast.info("Select user that you want to add in room",{
                    className:"toast-contact-message"
                })
                return
            }

            const roomInfo = {
                roomID:roomID,
                newUsername: username
            }

            const result = await addUserToRoom(roomInfo);
            const data = result.data;
            const newRoomID = data.roomID;
            const isPrivate = data.isPrivate;
            
            console.log("NEW ROOM ID: " + newRoomID );
            if(isPrivate){
                //users of the new rooms:
                console.log("ROOMS ssss: " + state.rooms);
                    
                const roomUsers = state.rooms.filter(room => room.roomID == roomID);

                const houseworker = roomUsers[0].users;
                console.log("RPPM :  " + roomUsers[0].users);
                //create new group (add user to new gruop)   
                dispatch({type:"CREATE_NEW_GRUOP" , roomID:roomID, newRoomID:newRoomID, user:houseworker, newUsername:username})
            }
            else{ //add user to existed group
                dispatch({type:"ADD_USER_TO_GROUP", roomID:roomID, newRoomID:newRoomID, newUsername:username});
            }

            toast.info("User is added to the room: "+ roomID );
        }
    
    return (
        //  <div className="chat-container">
        //     {state.loading ? <Spinner/> :
        //     <>
        //         <Rooms 
        //             rooms={state.rooms}
        //             houseworkers={state.houseworkers}
        //             roomRef={roomRef}
        //             user={user}
        //             onAddUserToGroupHanlder={onAddUserToGroupHanlder}
        //             onDeleteRoomHandler={onDeleteRoomHandler}
        //             onRoomClickHanlder={onRoomClickHanlder}
        //         />
            
        //         <Chat 
        //             socket={socket} 
        //             roomRef={roomRef}
        //             roomMessages={state.roomMessages}
        //             user={user}
        //         />
        //     </>
        //     }
        // </div>

        <div className='messages-container'>
            {state.loading ? <Spinner/> :
            <>
            <div className='row'>
                <nav className='menu'>
                    <ul>
                        <li className="item">
                            <i className="fa fa-home" aria-hidden="true">Ho</i>
                        </li>
                        <li className="item">
                            <i className="fa fa-user" aria-hidden="true">Us</i>
                        </li>
                        <li className="item">
                            <i className="fa fa-pencil" aria-hidden="true">Pe</i>
                        </li>
                        <li className="item item-active">
                            <i className="fa fa-commenting" aria-hidden="true">Co</i>
                        </li>
                        <li className="item">
                            <i className="fa fa-file" aria-hidden="true">Fi</i>
                        </li>
                        <li className="item">
                            <i className="fa fa-cog" aria-hidden="true">C</i>
                        </li>
                    </ul>
                </nav>

                <section className='rooms-container'>
                    <div className='room search'>
                        <div className="searchbar">
                            <i className="fa fa-search" aria-hidden="true">SIcon</i>
                            <input type="text" placeholder="Search..."></input>
                        </div>
                    </div>

                    <Rooms 
                        rooms={state.rooms}
                        houseworkers={state.houseworkers}
                        roomRef={roomRef}
                        user={user}
                        onAddUserToGroupHanlder={onAddUserToGroupHanlder}
                        onDeleteRoomHandler={onDeleteRoomHandler}
                        onRoomClickHanlder={onRoomClickHanlder}
                    />
                    
                </section>

                <section className = 'chat-container'>
                    <Chat 
                        socket={socket} 
                        roomRef={roomRef}
                        roomMessages={state.roomMessages}
                        user={user}
                    />
                </section>
            </div>
            </>
            }
        </div>
    )
}

export default Messages;

{/* <body>
    <div class="container">
        <div class="row">
            <nav class="menu">
                <ul class="items">
                    <li class="item">
                        <i class="fa fa-home" aria-hidden="true"></i>
                    </li>
                    <li class="item">
                        <i class="fa fa-user" aria-hidden="true"></i>
                    </li>
                    <li class="item">
                        <i class="fa fa-pencil" aria-hidden="true"></i>
                    </li>
                    <li class="item item-active">
                        <i class="fa fa-commenting" aria-hidden="true"></i>
                    </li>
                    <li class="item">
                        <i class="fa fa-file" aria-hidden="true"></i>
                    </li>
                    <li class="item">
                        <i class="fa fa-cog" aria-hidden="true"></i>
                    </li>
                </ul>
            </nav>

            <section class="discussions">
                <div class="discussion search">
                    <div class="searchbar">
                        <i class="fa fa-search" aria-hidden="true"></i>
                        <input type="text" placeholder="Search..."></input>
                    </div>
                </div>

                <div class="discussion message-active">
                    <div class="photo" style="background-image: url(https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80);">
                        <div class="online"></div>
                    </div>
                    <div class="desc-contact">
                        <p class="name">Megan Leib</p>
                        <p class="message">9 pm at the bar if possible 😳</p>
                    </div>
                    <div class="timer">12 sec</div>
                </div>

                <div class="discussion">
                    <div class="photo" style="background-image: url(https://i.pinimg.com/originals/a9/26/52/a926525d966c9479c18d3b4f8e64b434.jpg);">
                        <div class="online"></div>
                    </div>
                    <div class="desc-contact">
                        <p class="name">Dave Corlew</p>
                        <p class="message">Let's meet for a coffee or something today ?</p>
                    </div>
                    <div class="timer">3 min</div>
                </div>

                <div class="discussion">
                    <div class="photo" style="background-image: url(https://images.unsplash.com/photo-1497551060073-4c5ab6435f12?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=667&q=80);">
                    </div>
                    <div class="desc-contact">
                        <p class="name">Jerome Seiber</p>
                        <p class="message">I've sent you the annual report</p>
                    </div>
                    <div class="timer">42 min</div>
                </div>

                <div class="discussion">
                    <div class="photo" style="background-image: url(https://card.thomasdaubenton.com/img/photo.jpg);">
                        <div class="online"></div>
                    </div>
                    <div class="desc-contact">
                        <p class="name">Thomas Dbtn</p>
                        <p class="message">See you tomorrow ! 🙂</p>
                    </div>
                    <div class="timer">2 hour</div>
                </div>

                <div class="discussion">
                    <div class="photo" style="background-image: url(https://images.unsplash.com/photo-1553514029-1318c9127859?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=700&q=80);">
                    </div>
                    <div class="desc-contact">
                        <p class="name">Elsie Amador</p>
                        <p class="message">What the f**k is going on ?</p>
                    </div>
                    <div class="timer">1 day</div>
                </div>

                <div class="discussion">
                    <div class="photo" style="background-image: url(https://images.unsplash.com/photo-1541747157478-3222166cf342?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=967&q=80);">
                    </div>
                    <div class="desc-contact">
                        <p class="name">Billy Southard</p>
                        <p class="message">Ahahah 😂</p>
                    </div>
                    <div class="timer">4 days</div>
                </div>

                <div class="discussion">
                    <div class="photo" style="background-image: url(https://images.unsplash.com/photo-1435348773030-a1d74f568bc2?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1050&q=80);">
                        <div class="online"></div>
                    </div>
                    <div class="desc-contact">
                        <p class="name">Paul Walker</p>
                        <p class="message">You can't see me</p>
                    </div>
                    <div class="timer">1 week</div>
                </div>
            </section>

            <section class="chat">
                <div class="header-chat">
                    <i class="icon fa fa-user-o" aria-hidden="true"></i>
                    <p class="name">Megan Leib</p>
                    <i class="icon clickable fa fa-ellipsis-h right" aria-hidden="true"></i>
                </div>

                <div class="messages-chat">
                    <div class="message">
                        <div class="photo" style="background-image: url(https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80);">
                            <div class="online"></div>
                        </div>
                        <p class="text"> Hi, how are you ? </p>
                    </div>

                    <div class="message text-only">
                        <p class="text"> What are you doing tonight ? Want to go take a drink ?</p>
                    </div>
                    <p class="time"> 14h58</p>

                    <div class="message text-only">
                        <div class="response">
                            <p class="text"> Hey Megan ! It's been a while 😃</p>
                        </div>
                    </div>

                    <div class="message text-only">
                        <div class="response">
                        <p class="text"> When can we meet ?</p>
                        </div>
                    </div>
                    <p class="response-time time"> 15h04</p>
                
                    <div class="message">
                        <div class="photo" style="background-image: url(https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80);">
                        <div class="online"></div>
                        </div>
                        <p class="text"> 9 pm at the bar if possible 😳</p>
                    </div>
                    <p class="time"> 15h09</p>
                </div>

                <div class="footer-chat">
                    <i class="icon fa fa-smile-o clickable" style="font-size:25pt;" aria-hidden="true"></i>
                    <input type="text" class="write-message" placeholder="Type your message here"></input>
                    <i class="icon send fa fa-paper-plane-o clickable" aria-hidden="true"></i>
                </div>
            </section>
        </div>
    </div>
</body> */}

