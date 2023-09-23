import Spinner from "../../../UI/Spinner";
import Room from "./Room";

const Rooms = ({rooms, roomRef, user, houseworkers, onAddUserToGroupHanlder, onDeleteRoomHandler, onRoomClickHanlder, onChangeSelectHandler }) =>{

    return (
        <div className='room_conainter'>
                {rooms ?
                    rooms.map((el, index)=>(
                    <div className='rooms'><span className='roomLabel'>Room{index +1}</span>
                        <Room
                            roomInfo={el}
                            user={user}
                            roomRef={roomRef}
                            houseworkers={houseworkers}
                            onAddUserToGroupHanlder={onAddUserToGroupHanlder}
                            onDeleteRoomHandler={onDeleteRoomHandler}
                            onRoomClickHanlder={onRoomClickHanlder}
                            onChangeSelectHandler={onChangeSelectHandler}
                        />
                    </div>
                    ))
                : <Spinner></Spinner>
                }
                    
                {rooms.length==0 && <div className='no_rooms'>You have no conversation</div>}
                
            </div>
    )
}

export default Rooms;
