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
                                <source srcSet="assets/client.webp"/>
                                <img className='avatar' src='assets/client.png'></img>
                            </picture>
                        </div>
                        <div className='register-label'>Client</div>
                    </Link>
                </div>

                <div className='register-item'>
                    <Link to='/houseworkerRegister' className='register-link'>
                        <div className='avatar-container'>
                            <picture>
                                <source srcSet="assets/houseworker.webp"/>
                                <img className='avatar'src='assets/houseworker.png'></img>
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