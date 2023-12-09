import Spinner from "../../../UI/Spinner";
import Room from "./Room/Room.js";
import {memo} from 'react'

const Rooms = ({rooms, roomInfo, moreChatUsers, onRoomClickHanlder, onShowMoreUsersFromChatHandler, onUsersFromChatOutHanlder}) =>{

    return (
            <div className='rooms'>
            {console.log("Roomsss")}
                {rooms ?
                    rooms.map((el, index)=>(      
                        <Room
                            info={el}
                            roomInfo={roomInfo}
                            moreChatUsers={moreChatUsers}
                            onRoomClickHanlder={onRoomClickHanlder}
                            onShowMoreUsersFromChatHandler={onShowMoreUsersFromChatHandler}
                            onUsersFromChatOutHanlder={onUsersFromChatOutHanlder}
                        />
                    ))
                : <Spinner></Spinner>
                }
                {rooms.length==0 && <div className='no_rooms'>You have no conversation</div>}
            </div>
    )
}

export default Rooms;
