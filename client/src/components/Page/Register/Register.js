import {Link} from 'react-router-dom'

import '../../../sass/pages/Register/_register.scss';

const Register = () =>{

    return (
        <div className='register-container'>
            <div className='register-options'>

                <div className='register-item'>
                    <Link to='/clientRegister' className='register-link'>
                        <div className='avatar-container'>
                            <img src='assets/clientAvatar1.png'></img>
                        </div>
                        <div className='register-label'>Client</div>
                    </Link>
                </div>

                <div className='register-item'>
                    <Link to='/houseworkerRegister' className='register-link'>
                        <div className='avatar-container'>
                            <img src='assets/houseworkerAvatar1.png'></img>
                        </div>
                        <div className='register-label'>Houseworker</div>
                    </Link>
                </div>

            </div>
        </div>

    )
}

export default Register