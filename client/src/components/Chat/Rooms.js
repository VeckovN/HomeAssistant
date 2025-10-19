import {useRef, memo, useMemo} from 'react';
import Spinner from '../../components/UI/Spinner.js';
import Room from "./Room.js";
import {useSelector} from 'react-redux';

const Rooms = memo(({rooms, roomInfo, showMoreRoomUsers, onRoomClickHanlder, onShowMoreUsersFromChatHandler, onUsersFromChatOutHanlder}) =>{
    const {unreadMessages} = useSelector((state) => state.unreadMessages);
    const roomsContainerRef = useRef(null);

    //dispaly only more users of hovered room (that prevent to all Rooms be re-rendered)
    const activeShowUsers = useMemo(() => showMoreRoomUsers, [showMoreRoomUsers.roomID]) //rooms only re-render when the roomID changes

    const roomsList = useMemo(() => {
        if(!rooms || rooms.length === 0) return null;

        return rooms.map(el => {
            const unreadItem = unreadMessages.find(
                (item) => item.roomID === el.roomID
            );

            return(
                <Room
                    key={`room-${el.roomID}`}
                    info={el}
                    unreadItem={unreadItem}
                    roomInfo={roomInfo}
                    moreRoomUsers={activeShowUsers}
                    onRoomClickHanlder={onRoomClickHanlder}
                    onShowMoreUsersFromChatHandler={onShowMoreUsersFromChatHandler}
                    onUsersFromChatOutHanlder={onUsersFromChatOutHanlder}
                    roomsContainerRef={roomsContainerRef}
                />
            )
        })
    },[rooms, roomInfo, unreadMessages, activeShowUsers, onRoomClickHanlder, onShowMoreUsersFromChatHandler, onUsersFromChatOutHanlder]);

    return(
            <div className='rooms' ref={roomsContainerRef}>
                {rooms ? roomsList : <Spinner/>}
            </div>
    )
});

export default Rooms;
