import {useEffect, useState, useRef} from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
//socketio
import {io} from "socket.io-client";
import { toast } from 'react-toastify';
import useSocket from '../../../hooks/useSocket.js';

import './Chat.css'


const Chat = ({socket, connected}) =>{

    console.log("socket: " + socket);

    //null when not exists
    const {user} = useSelector((state) => state.auth)

    const userRedisID = user.userRedisID;

    const [rooms, setRooms] = useState([]);
    const [roomMessages, setRoomMessages] = useState([]);
    const [enteredRoomID, setEnteredRoomID] = useState('');
    const [newMessage, setNewMessage] = useState('');

    const [selectedUsername, setSelectedUsername] = useState('');
    const [houseworkers, setHouseworkers] = useState('');

    //ref for showned(click) Room 
    const roomRef = useRef();
    const messageRef = useRef();

    useEffect(() => {
    //ENSURE THAT socket.on IS RUN BEFORE socker INITIALIZATION
        if(connected && user){
            console.log("HEEEEEEEEE");
            //io.to(roomKey).emit("messageRoom", messageObj)
            //users which looking on chat will  receive message 
            socket.on("messageRoom", (contextObj) =>{
                const messageObj = JSON.parse(contextObj)
                //if our ID contains ID in room -> our ID:1 
                //if we aren't sender
                const users = messageObj.roomID.split(':');
                // console.log("USERS: " + typeof(users));
                console.log("Us1: " + users[0]);

                //add new message to other messages
                setRoomMessages(prev => (
                    [
                        ...prev,
                        messageObj
                    ]
                ))
                //console.log("EXIST: " + Users.inlcudes(userRedisID));
                console.log("MESSAGEOBJFROM : " + JSON.stringify(messageObj));
                console.log("OUR ID: " + userRedisID);
            })

            socket.on('show.room', (resp) =>{
                
            })
        }
    },[socket]) //on socket change (SOCKET WILL CHANGE WHEN IS MESSAGE SEND --- socket.emit)



//------------------------SOCKETS------------------------------

    const fetchAllRooms = async () =>{
        // const result = await axios.get(`http://localhost:5000/api/chat/rooms`)
        const result = await axios.get(`http://localhost:5000/api/chat/rooms/${user.username}`)
        const data = result.data;
        console.log("DATAaaaa: " + JSON.stringify(data));
        setRooms(data);
    }

    //onClick username read messages from him(from roomID where is it )
    const onRoomClickHanlder = async e =>{

        console.log("T: "  + enteredRoomID!='')
        console.log("PERVIOUS ROOMID: " + enteredRoomID);

        //check if we were in another roomID
        if(enteredRoomID!='')
            //console.log("SOCKET: " + socket);
            socket.emit('leave.room', enteredRoomID);  

        console.log(e.target.value);
        // const username = e.target.value.user; //id of our sender
        //const roomID = e.target.value.roomID;
        const roomID = e.target.value;
        //Assing clicked roomID to roomRef (read roomID valuewiht roomRef.current.value)
        roomRef.current = e.target;

        //EMIT SOCCEKT EVENT FOR ENTERING THIS ROOM
        //io.emit or smt (`room.join`, roomID) //in server will  socket.join(`room:${id}`); //join in this room
        //and notify all users in this room
        console.log("EMIIIIIIIIIIIT");
        socket.emit('room.join', roomID);
        setEnteredRoomID(roomID);
        
        //set enteredROomID -

        //server when receive this event will JOIN ROOM
        // socket.on("room.join", (id) => {
        //     socket.join(`room:${id}`);
        //   });

        //{Clicked room ID}
        console.log("REF VALUE: " + roomRef.current.value);
        
        const result = await axios.get(`http://localhost:5000/api/chat/room/${roomID}/messages?offset=0&size=50`)
        //MUST PARSE TO JSON BECASE WE GOT MESSAGES AS STRING JSON
        //const messages = JSON.parse(result.data);
        const messages = result.data;

        console.log("NESS: " + JSON.stringify(messages));

        // let parsedMessages
        // //parse each message to JSON
        // parsedMessages = messages.map(el => JSON.parse(el))

        //console.log(`http://localhost:5000/api/chat/room/${roomID}/messages?offset=0&size=50`)
        //const data = messages.data; //uneseserry because we return object wiht map(itns not promise)
        console.log("MESSAGES: " + JSON.stringify(messages));
        // console.log("PARRSED: " + JSON.stringify(parsedMessages));

        // setRoomMessages(parsedMessages);
        setRoomMessages(messages);
    }

    const onDeleteRoomHandler = async(e)=>{
        //take roomID 
        const roomID = e.target.value;
        // alert("ROOMID: " + e.target.value + "TYPE: " + typeof(roomID));

        //Delete SortedLIst Room 
        //room:1:2
        //PASS ONLY ROOMID
        const result = await axios.post('http://localhost:5000/api/chat/room/delete', {roomID:roomID});

        console.log("BEFORE ROOMS + "  + rooms);

        const otherRooms = rooms.filter(el => el.roomID!=roomID)

        //this will re-render rooms and message view
        setRooms(otherRooms);
        setRoomMessages([]);

        console.log("AFTER ROOMS " + otherRooms);

        console.log("DELETE ROOM RESULT: " + JSON.stringify(result));

        toast.success("Uspesno si obrisao sobu",{
            className:"toast-contact-message"
        });
    }

    //Fetch all houseworekr and show them as  select option
    useEffect(()=>{
        const getAllHouseworkers = async() =>{
            const result = await axios.get('http://localhost:5000/api/houseworker/') ;
            const houseworkerResult = result.data;
            setHouseworkers(houseworkerResult);

        }
        getAllHouseworkers();
    },[]) 

    const onAddUserToGroupHanlder = async(e)=>{
        const roomID = e.target.value;

        if(selectedUsername == ""){
            toast.info("Izaberi korisnika koga zelis da dodas u sobu",{
                className:"toast-contact-message"
            })
            return
        }
        // alert("ROOMID: " + roomID);

        //add useto
        const roomInfo = {
            roomID:roomID,
            newUsername: selectedUsername
        }

        const newRoomID = await axios.post('http://localhost:5000/api/chat/room/addUser',roomInfo);

        toast.info("User added to RoomID: "+ roomID );

        // setRooms(prev=>({
        //     ...prev,
        //     [roomID]:newRoomID
        // }))
        
    }

    const onChangeSelectHandler = (e)=>{
        const username = e.target.value ;
        setSelectedUsername(e.target.value)
    }

    console.log('"SEEEE: ' + selectedUsername);

    const onSendMessageHandler = () =>{
        //who send -> from prop
        //our userName -> userID
        const message = messageRef.current.value;
        const fromRoomID = roomRef.current.value;
        //

        if(message != ''){
            //In REDUX set redisID userID(for each username)
            // const from = 
            console.log("MESSAGE : " + message)
            messageRef.current.value = ''
            console.log("MEESAGES SEND FROM ROOMID: " + fromRoomID);
            //emit io.socket event for sending mesasge
            //this will trigger evento on server (in index.js) and send message to room
            const messageObj = {
                message:message,
                //who send message()
                from:userRedisID,
                roomID:fromRoomID,
                fromUsername:user.username

            }
            //emit message(server listen this for sending message to user(persist in db) )
            //and also client listen this event to notify another user for receiving message
            socket.emit('message', JSON.stringify(messageObj));
            //io.emit or somethingn ('message', messageObj)
            toast.success("Poruka je poslata",{
                className:'toast-contact-message'
            })
        }
        else
            toast.error("Ne mozes poslati praznu poruku",{
                className:'toast-contact-message'
            })
        
    }

    //console.log("ROOM: " + JSON.stringify(rooms));
    useEffect(() =>{
        fetchAllRooms()
    },[]) //change on socket on. show.room

    //on socket.show.room(add room)

    var messageContext;
    //console.log("ROMM MESSAGESS : " + JSON.stringify(roomMessages));
    return(
        <div className="chat_container">   
            <div className='room_conainter'>
                {rooms &&
                    rooms.map((el, index)=>(
                    <div className='rooms'><span className='roomLabel'>Soba {index +1}</span>
                        <div className='users'>{el.users.map((user,index)=> (<div className='roomUsers'>{user}<span/></div>))}</div>
                        <div className='room_buttons'>
                            <button value={el.roomID} ref={roomRef} onClick={onRoomClickHanlder}>Prikazi poruke </button>
                            {/* client can delete The chat room */}
                            {user.type=="Client" &&
                                <>
                                    <select onChange={onChangeSelectHandler}>
                                        {houseworkers && 
                                            <>
                                                <option value="">Izaberi korisnika</option>
                                            {
                                                houseworkers.map(el =>(
                                                    <option value={el.username}>{el.first_name}</option>
                                                ))
                                            }
                                            </>
                                        }
                                    </select>
                                    <button onClick={onAddUserToGroupHanlder} value={el.roomID}>Dodaj korisnika</button>
                                    <button onClick={onDeleteRoomHandler} value={el.roomID}>Izbrisi sobu</button>
                                </>
                            }
                        </div>
                    </div>
                    ))
                }
                    
                {rooms.length==0 && <div className='no_rooms'>Nemate poruke</div>}
                
            </div>

            
            <div className='messages_container'>
                {roomMessages.length >0 &&
                    <>
                        <div className='messages_box'>
                        {roomMessages.map(el =>{
                            if(userRedisID==el.from){
                                messageContext=' my_message'
                            }
                            else{
                                messageContext=' notMy_message'
                            }

                            return <>
                                
                                    <div className='message'>
                                        <div className={`context ${messageContext}`}><span> <span className='user_name'>{userRedisID==el.from ? 'Ja' : el.fromUsername}</span> : {el.message}</span> </div>
                                    </div>
                                </>
                        })}
                        <div className='sendMessageBox'>
                            <input
                                type='text'
                                name='message-text'
                                placeholder="Unesite poruku"
                                ref={messageRef}
                            />
                            
                            <button onClick={onSendMessageHandler}>Posalji</button>
                        </div>
                </div>
                        
                        {/* <MessageItem></MessageItem> */}
                    </>
                    
                }
                {newMessage && <div>NEW MESSAGE: {newMessage}</div>}
            </div>
        </div>
    )
}

export default Chat;