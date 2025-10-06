import {useRef} from 'react';
import Spinner from '../../components/UI/Spinner.js';
import Room from "./Room.js";
import {useSelector} from 'react-redux';

const Rooms = ({rooms, roomInfo, showMoreRoomUsers, onRoomClickHanlder, onShowMoreUsersFromChatHandler, onUsersFromChatOutHanlder}) =>{
    const {unreadMessages} = useSelector((state) => state.unreadMessages);
    const roomsContainerRef = useRef(null);

    return(
            <div className='rooms' ref={roomsContainerRef}>
                {rooms ?
                    rooms.map(el =>{      
                        const unreadItem = Object.values(unreadMessages).find(
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
                                roomsContainerRef={roomsContainerRef}
                            />
                        )
                    })
                : <Spinner/>
                }
            </div>
    )
}

export default Rooms;
