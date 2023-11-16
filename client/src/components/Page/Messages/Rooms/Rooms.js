import Spinner from "../../../UI/Spinner";
import Room from "./Room/Room.js";

import '../../../../sass/components/_rooms.scss';

const Rooms = ({rooms, roomRef, user, houseworkers, onAddUserToGroupHanlder, onDeleteRoomHandler, onRoomClickHanlder}) =>{

    return (
        // <div className='room-conainter'>
        //         {rooms ?
        //             rooms.map((el, index)=>(      
        //             <div className='rooms' key={el.roomID}><span className='room-label'></span>
        //                 <Room
        //                     roomInfo={el}
        //                     user={user}
        //                     roomRef={roomRef}
        //                     houseworkers={houseworkers}
        //                     onAddUserToGroupHanlder={onAddUserToGroupHanlder}
        //                     onDeleteRoomHandler={onDeleteRoomHandler}
        //                     onRoomClickHanlder={onRoomClickHanlder}
        //                 />
        //             </div>
        //             ))
        //         : <Spinner></Spinner>
        //         }
                    
        //         {rooms.length==0 && <div className='no_rooms'>You have no conversation</div>}
                
        //     </div>
            <>
                <div className='room search'>
                    <div className="searchbar">
                        <i className="fa fa-search" aria-hidden="true"></i>
                        <input type="text" placeholder="Search..."></input>
                    </div>
                </div>

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
