import {useState, useEffect} from 'react'; 
import Chat from './Chat.js';

const Messages = ({socket,connected}) =>{

    return (
        <div>
            <Chat socket={socket} connected={connected}/>
        </div>
    )
}

export default Messages;