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
                                <img className='avatar' src='https://res.cloudinary.com/dwcncwmpb/image/upload/v1735391545/Images/qmqbpleuwsltxg9dluh3-clientRegister.jpg'></img>
                            </picture>
                        </div>
                        <div className='register-label register-label-left'>Client</div>
                    </Link>
                </div>

                <div className='register-item'>
                    <Link to='/houseworkerRegister' className='register-link'>
                        <div className='avatar-container'>
                            <picture>
                                <img className='avatar'src='https://res.cloudinary.com/dwcncwmpb/image/upload/v1735391595/Images/fkjarilxvvaqltijdglh-hwRegister.jpg'></img>
                            </picture>
                        </div>
                        <div className='register-label register-label-right'>Houseworker</div>
                    </Link>
                </div>

            </div>
        </div>

    )
}

export default Register