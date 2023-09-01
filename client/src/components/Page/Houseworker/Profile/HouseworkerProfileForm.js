import axios from 'axios';
import Select from 'react-select';
import { city_options } from '../../../../utils/options';

const HouseworkerProfileForm = ({updatedData, houseworkerData, profession_options, onSubmitUpdate, onChange, onChangeProfession, onChangeCity  }) =>{
    return(
        <div className='profile_container'>
                <h1>Houseworker Profile</h1>

                <form className='profile_form' onSubmit={onSubmitUpdate}>
                    <div className ='professions'>
                        <label>Professions</label>
                            <Select 
                                className='dropdown'
                                placeholder="Select a profession"
                                options={profession_options}
                                onChange={onChangeProfession}
                                isClearable
                            />
                            {updatedData.profession && updatedData.profession != " " &&
                                <div className="working_hour">  
                                    <input 
                                        className='input_field'
                                        type='number'
                                        name='working_hour'
                                        placeholder='Enter working hour' 
                                        onChange={onChange}
                                    />
                                </div>}
                    </div>

                    <div className='input-label-form'>
                        <div className='profile_input-container'>
                            <label>First name: <b>{houseworkerData.first_name}</b></label>
                            <br/>
                            <input 
                            className='input_field'
                            type='text'
                            name='first_name'
                            value={updatedData.first_name}
                            placeholder='Enter first name'
                            onChange={onChange}
                            />
                        </div>

                        <div className='profile_input-container'>
                            <label>Last name: <b>{houseworkerData.last_name}</b></label>
                            <br/>
                            <input 
                            className='input_field'
                            type='text'
                            name='last_name'
                            value={updatedData.last_name}
                            placeholder='Enter last name'
                            onChange={onChange}
                            />
                        </div>
                        
                        <div className='profile_input-container'>
                            <label>Email: <b>{houseworkerData.email}</b></label>
                            <br/>
                            <input 
                            className='input_field'
                            type='email'
                            name='email'
                            value={updatedData.email}
                            placeholder='Enter email address'
                            onChange={onChange}
                            />
                        </div>

                        <div className='profile_input-container'>
                            <label>Password</label>
                            <br/>
                            <input 
                            className='input_field'
                            type='password'
                            name='password'
                            value={updatedData.password}
                            placeholder='Enter password'
                            onChange={onChange}
                            />
                        </div>

                        {updatedData.password &&  //only if is password entered
                        <div className='profile_input-container'>
                            <label>Repeat password</label>
                            <br/>
                            <input 
                            className='input_field'
                            type='password'
                            name='passwordRepeat'
                            value={updatedData.passwordRepeat}
                            placeholder='Repeat password'
                            onChange={onChange}
                            />
                        </div>
                        }


                        <div className='profile_input-container'>
                            <label>Address: <b>{houseworkerData.address}</b></label>
                            <br/>
                            <input 
                            className='input_field'
                            type='text'
                            name='address'
                            value={updatedData.address}
                            placeholder='Enter address'
                            onChange={onChange}
                            />
                        </div>

                        <div className='profile_input-container'>
                            <label>Phone number: <b>{houseworkerData.phone_number}</b></label>
                            <br/>
                            <input 
                            className='input_field'
                            type='number'
                            name='phone_number'
                            value={updatedData.phone_number}
                            placeholder='Enter phone number'
                            onChange={onChange}
                            />
                        </div>
                        
                        <div className='profile_input-container'>
                            <label>City: <b>{houseworkerData.city}</b></label>
                            <Select 
                                className='dropdown'
                                placeholder="Select a city"
                                options={city_options}
                                onChange={onChangeCity}
                                isClearable
                            />
                        </div>
                        <br></br>
                        {/* button for submit Above inputs  */}
                        <button type='submit' className='profile_submit'>Update</button>
                    </div>

                </form>
            </div>
    )

}

export default HouseworkerProfileForm;