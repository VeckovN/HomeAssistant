import Select from 'react-select';

const HouseworkerInputs = ({houseworkerData,register,errors,watch, cityField, city_options, onChangeCityHandler}) =>{
    return(
    <>
        <div className='profile_input-container'>
            <label>First name: <b>{houseworkerData.first_name}</b></label>
            <br/>
            <input 
                className='input_field'
                type='text'
                placeholder='Enter First name'
                {...register('first_name',{
                    pattern: {
                        value: /^[A-Z]+[a-z]?[a-zA-Z]+$/,
                        message: "Should start with Capital latter",
                    }
                })}
            />
            <div className='input_errors'>{errors.first_name?.message}</div>
        </div>

        <div className='profile_input-container'>
            <label>Last name: <b>{houseworkerData.last_name}</b></label>
            <br/>
            <input 
                className='input_field'
                type='text'
                placeholder='Enter Last name'
                {...register('last_name',{
                    pattern: {
                        value: /^[A-Z]+[a-z]?[a-zA-Z]+$/,
                        message: "Should start with Capital latter",
                    }
                })}
            />
            <div className='input_errors'>{errors.last_name?.message}</div>
        </div>
        
        <div className='profile_input-container'>
            <label>Email: <b>{houseworkerData.email}</b></label>
            <br/>
            <input 
                className='input_field'
                type='email'
                placeholder='Enter email address'
                autoComplete='off'
                {...register('email',{
                    pattern: {
                        value: /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/,
                        message: "Email address isn't correct",
                    }
                })}
            />
            <div className='input_errors'>{errors.email?.message}</div>
        </div>

        <div className='profile_input-container'>
            <label>Password</label>
            <br/>
            <input 
                className='input_field'
                type='password'
                placeholder='Enter password'
                autoComplete="off"
                {...register('password')}
            />
            <div className='input_errors'>{errors.password?.message}</div>
        </div>

        {watch('password') &&   //only if is password entered
        <div className='profile_input-container'>
            <label>Repeat password</label>
            <br/>
            <input 
                className='input_field'
                type='password'
                placeholder='Confirm the password'
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

        <div className='profile_input-container'>
            <label>Address: <b>{houseworkerData.address}</b></label>
            <br/>
            <input 
                className='input_field'
                type='text'
                placeholder='Enter address'
                {...register('address',{
                    pattern: {
                        value: /[A-Za-z0-9'\.\-\s\,]/,
                        message: "Invalid address",
                    }
                })}
            />
            <div className='input_errors'>{errors.address?.message}</div>
        </div>

        <div className='profile_input-container'>
            <label>Phone number: <b>{houseworkerData.phone_number}</b></label>
            <br/>
            <input 
                className='input_field'
                type='number'
                placeholder='Enter phone number'
                {...register("phone_number", {
                    pattern: {
                        value: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
                        message: "Invalid phone number format",
                    }
                })}
            />
            <div className='input_errors'>{errors.phone_number?.message}</div>
        </div>
        
        <div className='profile_input-container'>
            <label>City: <b>{houseworkerData.city}</b></label>
            <Select 
                className='dropdown'
                placeholder="Select a city"
                value={city_options.find(({value}) => value === cityField.value)}
                options={city_options}
                onChange={onChangeCityHandler}
                isClearable
            />
            <div className='input_errors'>{errors.city?.message}</div>
        </div>
    </>
    )
}

export default HouseworkerInputs;