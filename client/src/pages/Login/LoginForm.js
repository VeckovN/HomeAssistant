

const LoginForm = ({register, errors, handleSubmit, onSubmitHandler}) =>{
    return (
        <>
            <div className ='login_container'>
                <div className="login_context">

                    <picture className="login-image">
                        <source srcSet="../../assets/images/loginBackground.webp" type="../../assets/images/webp"/>
                        <img
                            src={require('../../assets/images/loginBackground.jpg')}
                            alt="Login Image"
                            className="login-image"
                        />
                    </picture>

                    <div className='context-item'>

                        <div className='login_welcome'>
                            <h3>Welcome</h3>
                            <div className='logo-h'>Home Assistant</div>
                        </div>

                        <div className='demo_accounts'>
                            <div className='demo_accounts-title'>Demo Accounts</div>
                            <div className='accounts'>
                                <div className='account-item'>
                                    <div className='account-item-type'>Client</div>
                                    <div>Username: <span>Veckov</span></div>
                                    <div>Password: <span>veckov</span></div>
                                </div>
                                <div>
                                    <div className='account-item-type'>Houseworker</div>
                                    <div>Username: <span>Sara22</span></div>
                                    <div>Password: <span>sara22</span></div>
                                </div>
                            </div>
                        </div>


                        <form onSubmit={handleSubmit(onSubmitHandler)} className='login_form'>
                            <div className='input_container'>
                                <input
                                    type='text'
                                    placeholder='Enter a username'
                                    //register has (name="username", onChange, onBlur and ref props) 
                                    {...register('username')}
                                    className={`login_input ${errors.username ? 'error' : ''}`}
                                />
                                <div className="input_error">{errors.username?.message}</div>
                            </div>
                            
                            <div className='input_container'>
                                <input
                                    type='password'
                                    placeholder='Enter password'
                                    autoComplete="off"
                                    {...register('password')}
                                    className={`login_input ${errors.password ? 'error' : ''}`}
                                />
                                <div className="input_error">{errors.password?.message}</div>
                            </div>

                            <div className ='button_container'>
                                <button type='submit' className='btn'>Log in</button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}

export default LoginForm;