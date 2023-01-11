import {useSelector} from 'react-redux'

import ClientProfile from './Client/ClientProfile';
import HouseworkerProfile from './Houseworker/HouseworkerProfile';


const Profile = () =>{

    const {user} = useSelector((state) => state.auth)
    var client;
    if(user)
        client = user.type === 'Client' ? true : false;

    return (
        <>
            {client ? <ClientProfile/> : <HouseworkerProfile/> }
        </>
    )

}

export default Profile;