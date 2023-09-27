import Spinner from "../../../UI/Spinner";
import Room from "./Room/Room.js";

const Rooms = ({rooms, roomRef, user, selectedUsername, houseworkers, searchTerm, onSearchHandler, onAddUserToGroupHanlder, onDeleteRoomHandler, onRoomClickHanlder, onChangeSearchInputHandler }) =>{

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
                            selectedUsername={selectedUsername}
                            searchTerm={searchTerm}
                            onSearchHandler={onSearchHandler}
                            onAddUserToGroupHanlder={onAddUserToGroupHanlder}
                            onDeleteRoomHandler={onDeleteRoomHandler}
                            onRoomClickHanlder={onRoomClickHanlder}
                            onChangeSearchInputHandler={onChangeSearchInputHandler}
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
