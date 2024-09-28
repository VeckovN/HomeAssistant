import {Link} from 'react-router-dom'

import '../../sass/pages/Register/_register.scss';

const Register = () =>{

    return (
        <div className='register-container'>
            <div className='register-options'>

                <div className='register-item'>
                    <Link to='/clientRegister' className='register-link'>
                        <div className='avatar-container'>
                            <picture>
                                <source srcSet="assets/c5.webp"/>
                                <img className='avatar' src='assets/c5.jpg'></img>
                            </picture>
                        </div>
                        <div className='register-label'>Client</div>
                    </Link>
                </div>

                <div className='register-item'>
                    <Link to='/houseworkerRegister' className='register-link'>
                        <div className='avatar-container'>
                            <picture>
                                <source srcSet="assets/hs6.webp"/>
                                <img className='avatar'src='assets/hs6.jpg'></img>
                            </picture>
                        </div>
                        <div className='register-label'>Houseworker</div>
                    </Link>
                </div>

            </div>
        </div>

    )
}

export default Register