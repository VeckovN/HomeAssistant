import {Link} from 'react-router-dom'


const Register = () =>{

    return (
        <div>
            <h1>Register page</h1>
            <Link to='/clientRegister'>Client</Link>
            <br/>
            <Link to='/houseworkerRegister'>HouseWorker</Link>
        </div>
    )
}

export default Register