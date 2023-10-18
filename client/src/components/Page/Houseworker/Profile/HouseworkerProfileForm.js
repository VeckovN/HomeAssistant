import axios from 'axios';
import Select from 'react-select';
import { city_options, profession_options } from '../../../../utils/options';
import { update } from 'lodash';

const HouseworkerProfileForm = ({updatedData, houseworkerData, cityField, register, errors, watch, handleSubmit, onChangeWorkingHour, onChangeProffesions, onChangeHouseworkerProfessions, onSubmitUpdate, onChangeProfession, onChangeCityHandler, onAddProfessionHandler, onChangeProfessionHandler, onDeleteProfessionHandler }) =>{
    
    console.log("PROFESSION UPDATED STATE: " + JSON.stringify(updatedData) + "\n")
    return(
        <div className='profile_container'>
                <h1>Houseworker Profile</h1>
                <form className='profile_form' onSubmit={handleSubmit(onSubmitUpdate)}>
                    <div className ='professions'>
                        <div className="profession_changing">
                        <label>Professions</label>
                            <Select 
                                className='dropdown'
                                placeholder="Select a profession"
                                options={houseworkerData.professions}
                                // value={houseworkerData.profession}
                                value={houseworkerData.profession}
                                onChange={onChangeProfession}
                                isClearable
                            />
                            {updatedData.profession && updatedData.profession != " " &&
                                <div className='profile_input-container'> 
                                    <input 
                                        className='input_field'
                                        type='number'
                                        name='working_hour'
                                        placeholder='Enter working hour' 
                                        onChange={onChangeWorkingHour}
                                    />
                                    <br/>
                                    
                                    {
                                    updatedData.working_hour != "" &&
                                    <div className="add_profession_button">
                                        <button onClick={onChangeProfessionHandler}>ChangeProfession</button>
                                    </div>
                                    }
                                    
                                    <div className = "delete_profession_button">
                                        {/* without ()=> this function will be executed immediately , also pass the e(event) for e.preventDefault*/}
                                        <button onClick={(e) => onDeleteProfessionHandler(e, updatedData.profession)} >Delete Profession</button>
                                    </div>
                                </div>
                                }
                        </div>
                        <div className='profession_adding'>
                            <label>Add Profession</label>
                            <Select 
                                className='dropdown'
                                placeholder="Select a profession"
                                options={houseworkerData.not_owned_professions}
                                value={houseworkerData.profession}
                                onChange={onChangeProffesions}
                                isClearable
                                isMulti
                            />
                            {  //list profession
                                updatedData.professions.map((el,index) => (
                                <div key={index}>
                                    <label><b>{el}</b></label>
                                    <input 
                                        className='input_field'
                                        type='number'
                                        name={el} //selected profession
                                        placeholder={`Enter ${el} working hour`} 
                                        onChange={onChangeHouseworkerProfessions}
                                    />
                                </div>    
                                ))

                            }
                            {
                                updatedData.houseworker_professions.length >0 && 
                                    <div className='profession_add_button'>
                                        <button onClick={onAddProfessionHandler}> Add</button>
                                    </div>
                            }
                        </div>
                    </div>

                    <div className='input-label-form'>
                        <div className='profile_input-container'>
                            <label>First name: <b>{houseworkerData.first_name}</b></label>
                            <br/>
                            <input 
                                className='input_field'
                                type='text'
                                id='first_name'
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
                                id='last_name'
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
                                id='email'
                                placeholder='Enter email address'
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
                                autocomplete="off"
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
                                name='passwordRepeat'
                                placeholder='Confirm the password'
                                autocomplete="off"
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
                                name='address'
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
                                name='phone_number'
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
                        <br></br>
                        <button type='submit'  className='profile_submit'>Update</button>
                    </div>

                </form>
            </div>
    )

}

export default HouseworkerProfileForm;