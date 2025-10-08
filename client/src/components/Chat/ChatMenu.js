import {useState, useMemo, memo} from 'react';

import '../../sass/components/_chatMenu.scss';

const ChatMenu = memo(({houseworkers, roomInfo, onAddUserToGroupHanlder, onKickUserFromGroupHandler, onDeleteRoomHandler}) =>{
    const [selectedUsername, setSelectedUsername] = useState(''); //clicked username form list
    const [searchTerm, setSearchTerm] = useState(''); // entered houseworker username(not selected)

    const [selectedKickUsername , setSelectedKickUsername] = useState('');
    const [searchKickTerm, setSearchKickTerm] = useState('');
 
    const SelectedHandler = (username) => setSelectedUsername(username); 
    const SelectedKickUserHandler = (username) => setSelectedKickUsername(username);

    const ChangeSearchInputHandler = (e) =>{
        if(selectedUsername!='')
            setSelectedUsername('')
        setSearchTerm(e.target.value);
    }

    const ChangeSearchKickInputHandler = (e) =>{
        if(selectedKickUsername!='')
            setSelectedKickUsername('')
        setSearchKickTerm(e.target.value);
    }

    const AddUserToGroupHandler = (roomID, username) =>{
        setSelectedUsername('');
        setSearchTerm('');
        onAddUserToGroupHanlder(roomID, username);
    }

    const KickUserFromGroupHandler = (roomID, username) =>{
        setSelectedKickUsername('');
        setSearchKickTerm('');
        onKickUserFromGroupHandler(roomID, username);
    }

    const filteredHouseworkers = useMemo(() =>{
        if(!searchTerm || selectedUsername) return [];
        
        const searchInput = searchTerm.toLowerCase();

        return houseworkers
            .filter(item => {
                const usernameMatch = item.username.toLowerCase();
                const usernameStartsWithSerachInput = usernameMatch.startsWith(searchInput);
                const isNotInRoomUsers = !roomInfo.users?.some(user => user.username === item.username);
                return usernameStartsWithSerachInput && isNotInRoomUsers
            })
            .slice(0, 10);
    },[houseworkers, searchTerm, selectedUsername, roomInfo.users])

    const filteredKickUsers = useMemo(() =>  {
        if (!searchKickTerm || selectedKickUsername) return [];

        const searchInput = searchKickTerm.toLowerCase();
        return roomInfo.users
            .filter(item => {
                const usernameMatch = item.username.toLowerCase();
                return usernameMatch.startsWith(searchInput);
            })
            .slice(0, 5);
    },[roomInfo.users, searchKickTerm, selectedKickUsername]);
    
    return (
    <div className='chat-menu-container'>
        <div className='menu-option'> 
            <div className='add-user-container'> 
                <p className="menu-option-title">Add User </p>
                <div className="searchbar">
                    <i className="fa fa-search" aria-hidden="true"></i>
                    <input  
                        className='menu-search-input'
                        placeholder='Enter houseworker username'
                        type='text'
                        onChange={(e)=> ChangeSearchInputHandler(e)}  
                        value={selectedUsername!='' ? selectedUsername : searchTerm}                  
                    />
                </div>
                <div className='dropdown-list'>
                    {
                    filteredHouseworkers.map((item) =>(
                        <div className='dropdown-row' key={item.id} >
                            <div
                                onClick={() => SelectedHandler(item.username)}
                                className='dropdown-row-item'>{item.username}
                            </div>
                        </div>
                    ))
                    }
                </div>
                <div className='user-button'>
                    <button 
                        className='add-user-to-group-btn'
                        onClick={()=> AddUserToGroupHandler(roomInfo.roomID, selectedUsername)}
                        disabled={!selectedUsername}
                        >Add user
                    </button>
                </div>
            </div>
        </div>

        {roomInfo.users?.length > 1 &&
            <div className='menu-option'> 
                <div className='kick-user-container'>
                    <p className='menu-option-title'>Kick User </p>
                    <div className="searchbar">
                        <i className="fa fa-search" aria-hidden="true"></i>
                        <input  
                            className='menu-search-input'
                            placeholder='Enter houseworker username'
                            type='text'
                            onChange={(e)=> ChangeSearchKickInputHandler(e)}   
                            value={selectedKickUsername!='' ? selectedKickUsername : searchKickTerm}                
                        />
                    </div>
                    <div className='dropdown-list'>
                        {
                        // show only room members 
                        filteredKickUsers.map((item) =>(
                            <div
                                key={`user-${item.username}`} 
                                onClick={() => SelectedKickUserHandler(item.username)}
                                className='dropdown-row'>{item.username}
                            </div>
                        ))
                        }
                    </div>
                    <div className='user-button'>
                        <button 
                            className='kick-user-from-group-btn'
                            onClick={()=> KickUserFromGroupHandler(roomInfo.roomID, selectedKickUsername)}
                            disabled={!selectedKickUsername}
                            >Kick user
                        </button>
                </div>
            </div>
        </div>
        }
        <div className='menu-option'>
            <div className='delete-container'>
                <p className='menu-option-title'>Delete Chat </p>
                <button className='delete-room-btn' onClick={onDeleteRoomHandler} value={roomInfo.roomID}>Delete room</button>
            </div>
        </div>
    </div>
    )
});
export default ChatMenu;