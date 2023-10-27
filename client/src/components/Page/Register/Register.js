import {Link} from 'react-router-dom'

// import './Register.css'
import '../../../sass/pages/Register/_register.scss';

const Register = () =>{

    return (
        <div className='register-container'>
            <div className='register-options'>
                <div className='register-item'>
                    <Link to='/clientRegister' className='register-link'>Client</Link>
                </div>
                <div className='register-item'>
                    <Link to='/houseworkerRegister' className='register-link'>Houseworker</Link>
                </div>
            </div>
        </div>

    )
}

export default Register