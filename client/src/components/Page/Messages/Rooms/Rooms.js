import Spinner from "../../../UI/Spinner";
import Room from "./Room/Room.js";
import {memo} from 'react'

const Rooms = ({rooms, roomInfo, roomRef, user, houseworkers, onAddUserToGroupHanlder, onDeleteRoomHandler, onRoomClickHanlder}) =>{

    console.log("roomREFFFFF ROOMS: ", roomRef.current);
    return (
            <>
            {console.log("Roomsss")}
                {rooms ?
                    rooms.map((el, index)=>(      
                        <Room
                            info={el}
                            user={user}
                            roomRef={roomRef}
                            roomInfo={roomInfo}
                            houseworkers={houseworkers}
                            onAddUserToGroupHanlder={onAddUserToGroupHanlder}
                            onDeleteRoomHandler={onDeleteRoomHandler}
                            onRoomClickHanlder={onRoomClickHanlder}
                        />
                    ))
                : <Spinner></Spinner>
                }
                {rooms.length==0 && <div className='no_rooms'>You have no conversation</div>}
            </>
    )
}

export default Rooms;
