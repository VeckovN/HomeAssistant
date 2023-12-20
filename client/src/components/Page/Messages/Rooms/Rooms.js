import Spinner from "../../../UI/Spinner";
import Room from "./Room/Room.js";

const Rooms = ({rooms, roomInfo, showMoreRoomUsers, onRoomClickHanlder, onShowMoreUsersFromChatHandler, onUsersFromChatOutHanlder}) =>{
    return (
            <div className='rooms'>
            {console.log("Roomsss")}
                {rooms ?
                    rooms.map((el, index)=>(      
                        <Room
                            key={el.roomID}
                            info={el}
                            roomInfo={roomInfo}
                            moreRoomUsers={showMoreRoomUsers}
                            onRoomClickHanlder={onRoomClickHanlder}
                            onShowMoreUsersFromChatHandler={onShowMoreUsersFromChatHandler}
                            onUsersFromChatOutHanlder={onUsersFromChatOutHanlder}
                        />
                    ))
                : <Spinner></Spinner>
                }
            </div>
    )
}

export default Rooms;
