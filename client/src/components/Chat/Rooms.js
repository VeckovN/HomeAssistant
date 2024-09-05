import Spinner from '../../components/UI/Spinner.js';
import Room from "./Room.js";

const Rooms = ({rooms, roomInfo, unread, showMoreRoomUsers, onRoomClickHanlder, onShowMoreUsersFromChatHandler, onUsersFromChatOutHanlder}) =>{
    return(
            <div className='rooms'>
                {rooms ?
                    rooms.map(el =>{      
                        const unreadItem = Object.values(unread).find(
                            (item) => item.roomID === el.roomID
                        );
                        return(
                            <Room
                                key={`room-${el.roomID}`}
                                info={el}
                                unreadItem={unreadItem}
                                roomInfo={roomInfo}
                                moreRoomUsers={showMoreRoomUsers}
                                onRoomClickHanlder={onRoomClickHanlder}
                                onShowMoreUsersFromChatHandler={onShowMoreUsersFromChatHandler}
                                onUsersFromChatOutHanlder={onUsersFromChatOutHanlder}
                            />
                        )
                    })
                : <Spinner/>
                }
            </div>
    )
}

export default Rooms;
