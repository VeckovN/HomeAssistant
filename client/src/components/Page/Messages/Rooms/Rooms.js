import Spinner from "../../../UI/Spinner";
import Room from "./Room/Room.js";

const Rooms = ({rooms, roomRef, user, houseworkers, onAddUserToGroupHanlder, onDeleteRoomHandler, onRoomClickHanlder}) =>{

    return (
            <>
                {rooms ?
                    rooms.map((el, index)=>(      
                        <Room
                            roomInfo={el}
                            user={user}
                            roomRef={roomRef}
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
