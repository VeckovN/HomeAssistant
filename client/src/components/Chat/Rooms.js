import Spinner from '../../components/UI/Spinner.js';
import Room from "./Room.js";

const Rooms = ({rooms, roomInfo, showMoreRoomUsers, onRoomClickHanlder, onShowMoreUsersFromChatHandler, onUsersFromChatOutHanlder}) =>{
    return (
            <div className='rooms'>
                {rooms ?
                    rooms.map(el =>(      
                        <Room
                            key={`room-${el.roomID}`}
                            info={el}
                            roomInfo={roomInfo}
                            moreRoomUsers={showMoreRoomUsers}
                            onRoomClickHanlder={onRoomClickHanlder}
                            onShowMoreUsersFromChatHandler={onShowMoreUsersFromChatHandler}
                            onUsersFromChatOutHanlder={onUsersFromChatOutHanlder}
                        />
                    ))
                : <Spinner/>
                }
            </div>
    )
}

export default Rooms;
