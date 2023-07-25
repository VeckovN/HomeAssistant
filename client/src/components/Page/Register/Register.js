import {Link} from 'react-router-dom'

import './Register.css'

const Register = () =>{

    return (
        <div className='registre_container'>
            <div className='register_options'>
                <div className='register_item'>
                    <Link to='/clientRegister' className='register_link'>Client</Link>
                </div>
                <div className='register_item'>
                    <Link to='/houseworkerRegister' className='register_link'>Houseworker</Link>
                </div>
            </div>
        </div>

    )
}

export default Register