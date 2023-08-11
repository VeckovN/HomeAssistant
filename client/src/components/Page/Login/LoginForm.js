
const LoginForm = ({username, password, onChange, onSubmit}) =>{

    return (
        <>
            <div className ='login_container'>
                <div className="login_context">
                    <div className='login_welcome'>
                        <h3>Welcome</h3>
                        <div className='logo-h'>Home Assistant</div>
                    </div>
                    <form className='login_form'>
                        <div className='input_container'>
                            <input
                                className='input_field'
                                type='text'
                                name='username'
                                value={username}
                                placeholder='Enter username'
                                onChange={onChange}
                            />
                        </div>

                        <div className='input_container'>
                            <input
                                className='input_field'
                                type='password'
                                name='password'
                                value={password}
                                placeholder='Enter password'
                                onChange={onChange}
                            />
                        </div>

                        <div className ='button_container'>
                            <button type='submit' onClick={onSubmit} className='btn'>Log in</button>
                        </div>

                    </form>
                </div>
            </div>

        </>
    )
}

export default LoginForm