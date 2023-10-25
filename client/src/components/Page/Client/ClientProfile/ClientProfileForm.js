import Select from 'react-select';
import Spinner from '../../../UI/Spinner';


const ClientProfileForm = ({loading, clientData, cityField, errors, register, watch, city_options,handleSubmit ,onSubmitUpdate,onSubmitUpdateHandler, onCityChangeHandler }) =>{

    return(
        <div className='profile-container'>
            {loading ? <Spinner/> :
            <>
                <h1>Client Profile</h1>
                <form className='cl-profile-form' onSubmit={handleSubmit(onSubmitUpdate)}>
                    {/* left side */}
                    <div className='input-label-form'>
                        <div className='profile-input-container'>
                            <label>First Name: <b>{clientData.first_name}</b></label>
                            <br/>
                            <input
                                className='input-field'
                                type='type'
                                id='first_name'
                                placeholder='Enter First name'
                                {...register("first_name", {
                                    pattern: {
                                        value: /^[A-Z]+[a-z]?[a-zA-Z]+$/,
                                        message: "Should start with Capital latter",
                                    }
                                })}
                            />
                            <div className='input_errors'>{errors.first_name?.message}</div>
                        </div>

                        <div className='profile-input-container'>
                            <label>Last name: <b>{clientData.last_name}</b></label>
                            <br/>
                            <input
                                className='input-field'
                                type='type'
                                id='last_name'
                                placeholder='Enter last name'
                                {...register("last_name", {
                                    pattern: {
                                        value: /^[A-Z]+[-'s]?[a-zA-Z ]+$/,
                                        message: "Should start with Capital a latter",
                                    }
                                })}
                            />
                            <div className='input_errors'>{errors.last_name?.message}</div>
                        </div>

                        <div className='profile-input-container'>
                            <label>Email: <b>{clientData.email}</b></label>
                            <br/>
                            <input
                                className='input-field'
                                type='email'
                                id='email'
                                placeholder='Enter email address'
                                autoComplete='off'
                                {...register("email", {
                                    pattern: {
                                        value: /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/,
                                        message: "Email address isn't correct",
                                    }
                                })}
                            />
                            <div className='input_errors'>{errors.email?.message}</div>
                        </div>

                        <div className='profile-input-container'>
                            <label>Password</label>
                            <br/>
                            <input 
                                className='input-field'
                                type='password'
                                placeholder='Enter a password'
                                autoComplete="new-password"
                                {...register('password')}
                                />
                            <div className='input_errors'>{errors.password?.message}</div>
                        </div>

                        {watch('password') &&  //only if is password entered
                        <div className='profile-input-container'>
                            <label>Confirm password</label>
                            <br/>
                            <input 
                                className='input-field'
                                type='password'
                                id='confirmPassword'
                                placeholder='Confirm password'
                                autoComplete="off"
                                {...register('confirmPassword' , {
                                    validate:(val) =>{
                                        if(watch('password') !=val){
                                            return "Your password must match"
                                        }
                                    }
                                })}
                            />
                            <div className='input_errors'>{errors.confirmPassword?.message}</div>
                        </div>
                        }

                        <div className='profile-input-container'>
                            <label>City: <b>{clientData.city}</b></label><br/>
                            <Select 
                                className='dropdown'
                                placeholder="Select a city"
                                value={city_options.find(({value}) => value === cityField.value)}
                                options={city_options}
                                onChange={onCityChangeHandler}
                                isClearable
                            />
                            <div className='input_errors'>{errors.city?.message}</div>
                        </div>
                        <br></br>

                        {/* button for submit Above inputs  */}
                        <button type='submit' className='profile-submit'>Update</button>
                    </div>
                </form>
            </>
            }
      </div>
    )
}

export default ClientProfileForm;