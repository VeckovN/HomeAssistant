import Select from 'react-select';

const HouseworkerInputs = ({houseworkerData,register,errors,watch, cityField, city_options, onChangeCityHandler}) =>{
    return(
    <>
        <div className='profile-input-card'>
            <label>First name: <span>{houseworkerData.first_name}</span></label>
            <br/>
            <input 
                className='input-field'
                type='text'
                placeholder='Enter First name'
                {...register('first_name',{
                    pattern: {
                        value: /^[A-Z]+[a-z]?[a-zA-Z]+$/,
                        message: "Should start with Capital latter",
                    }
                })}
            />
            <div className='input-errors'>{errors.first_name?.message}</div>
        </div>

        <div className='profile-input-card'>
            <label>Last name: <span>{houseworkerData.last_name}</span></label>
            <br/>
            <input 
                className='input-field'
                type='text'
                placeholder='Enter Last name'
                {...register('last_name',{
                    pattern: {
                        value: /^[A-Z]+[a-z]?[a-zA-Z]+$/,
                        message: "Should start with Capital latter",
                    }
                })}
            />
            <div className='input-errors'>{errors.last_name?.message}</div>
        </div>
        
        <div className='profile-input-card'>
            <label>Email: <span>{houseworkerData.email}</span></label>
            <br/>
            <input 
                className='input-field'
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
            <div className='input-errors'>{errors.email?.message}</div>
        </div>

        <div className='profile-input-card'>
            <label>Password</label>
            <br/>
            <input 
                className='input-field'
                type='password'
                placeholder='Enter password'
                autoComplete="off"
                {...register('password')}
            />
            <div className='input-errors'>{errors.password?.message}</div>
        </div>

        {watch('password') &&   //only if is password entered
        <div className='profile-input-card'>
            <label>Repeat password</label>
            <br/>
            <input 
                className='input-field'
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
            <div className='input-errors'>{errors.confirmPassword?.message}</div>
        </div>
        }

        <div className='profile-input-card'>
            <label>Address: <span>{houseworkerData.address}</span></label>
            <br/>
            <input 
                className='input-field'
                type='text'
                placeholder='Enter address'
                {...register('address',{
                    pattern: {
                        value: /[A-Za-z0-9'\.\-\s\,]/,
                        message: "Invalid address",
                    }
                })}
            />
            <div className='input-errors'>{errors.address?.message}</div>
        </div>

        <div className='profile-input-card'>
            <label>Phone number: <span>{houseworkerData.phone_number}</span></label>
            <br/>
            <input 
                className='input-field'
                type='number'
                placeholder='Enter phone number'
                {...register("phone_number", {
                    pattern: {
                        value: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
                        message: "Invalid phone number format",
                    }
                })}
            />
            <div className='input-errors'>{errors.phone_number?.message}</div>
        </div>
        
        <div className='profile-input-card'>
            <label>City: <span>{houseworkerData.city}</span></label>
            <Select 
                className='dropdown'
                placeholder="Select a city"
                value={city_options.find(({value}) => value === cityField.value)}
                options={city_options}
                onChange={onChangeCityHandler}
                isClearable
            />
            <div className='input-errors'>{errors.city?.message}</div>
        </div>

        <div className='profile-input-card'>  
            <label>Description: </label>     
            <br/>  
            <textarea  
                rows="4" 
                cols="30" 
                placeholder={houseworkerData.description}
                {...register('description', {
                    pattern: {
                        // value: /[A-Za-z0-9'\.\-\s\,]{0,50}/,
                        value :/^[a-zA-Z0-9\s.,!?'"-]{0,100}$/,
                        message: "Too long description",
                    }
                })}

            />
            <div className='input-errors'>{errors.description?.message}</div>
        </div>
    </>
    )
}

export default HouseworkerInputs;