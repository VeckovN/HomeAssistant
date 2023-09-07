import axios from 'axios';
import Select from 'react-select';
import { city_options, profession_options } from '../../../../utils/options';
import { update } from 'lodash';

const HouseworkerProfileForm = ({updatedData, houseworkerData, onChangeProffesions, onChangeHouseworkerProfessions, onSubmitUpdate, onChange, onChangeProfession, onChangeCity, onAddProfessionHandler, onChangeProfessionHandler, onDeleteProfessionHandler }) =>{
    
    console.log("PROFESSION UPDATED STATE: " + JSON.stringify(updatedData) + "\n")
    return(
        <div className='profile_container'>
                <h1>Houseworker Profile</h1>

                <form className='profile_form' onSubmit={onSubmitUpdate}>
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
                                        onChange={onChange}
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
                        <button type='submit' className='profile_submit'>Update</button>
                    </div>

                </form>
            </div>
    )

}

export default HouseworkerProfileForm;