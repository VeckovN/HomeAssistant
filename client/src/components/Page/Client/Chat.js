import {useEffect, useState} from 'react';
import axios from 'axios';


const Chat = () =>{

    const [rooms, setRooms] = useState([]);
    const [roomMessages, setRoomMessages] = useState([]);


    const fetchAllRooms = async () =>{
        const result = await axios.get(`http://localhost:5000/api/chat/rooms`)
        const data = result.data;
        console.log("DATA: " + JSON.stringify(data));
        setRooms(data);
    }

    //for each room take messages from it


    //get senderUsername


    //onClick username read messages from him(from roomID where is it )
    const onRoomClickHanlder = async e =>{
        console.log(e.target.value);
        // const username = e.target.value.user; //id of our sender
        //const roomID = e.target.value.roomID;
        const roomID = e.target.value;
        
        const result = await axios.get(`http://localhost:5000/api/chat/room/${roomID}/messages?offset=0&size=50`)
        //MUST PARSE TO JSON BECASE WE GOT MESSAGES AS STRING JSON
        //const messages = JSON.parse(result.data);
        const messages = result.data;
        let parsedMessages

        //parse each message to JSON
        parsedMessages = messages.map(el => JSON.parse(el))

        console.log(`http://localhost:5000/api/chat/room/${roomID}/messages?offset=0&size=50`)
        //const data = messages.data; //uneseserry because we return object wiht map(itns not promise)
        console.log("MESSAGES: " + JSON.stringify(messages));
        console.log("PARRSED: " + JSON.stringify(parsedMessages));

        setRoomMessages(parsedMessages);

        //read message for roomID
        //setRoomMessages();
    }

    console.log("ROOM: " + JSON.stringify(rooms));
    useEffect(() =>{
        fetchAllRooms()
    },[])

    console.log("ROMM MESSAGESS : " + JSON.stringify(roomMessages));

    return(
        <div className="Chat">   
            <h1>Rooms</h1>
            <br></br>
            <ul>
                {rooms ?
                    rooms.map((el, index)=>(
                        <li>Room{index}___
                            <button value={el} onClick={onRoomClickHanlder}> ID:{el.roomID} Username: {el.user} </button>
                        </li>
                    ))
                    :
                    <div>No rooms</div>
                }

                {roomMessages &&
                    <>
                        <h3>Messages</h3>
                        <ul>
                        {roomMessages.map(el =>(
                            <li>
                                <div>Message: {el.message}</div>
                                <div>From: {el.from}</div>
                                <br/>
                            </li>
                        ))}
                        </ul>
                        {/* <MessageItem></MessageItem> */}
                    </>
                    
                }
            </ul>
        </div>
    )

}

export default Chat;