import Select from 'react-select';
import { city_options } from "../../../../utils/options"

const ClientProfileForm = ({clientData, updatedData, onSubmitUpdate, onChangeUpdate, onChangeCity }) =>{

    return(
        <div className='profile_container'>
          <h1>Client Profile</h1>
                <form className='profile_form' onSubmit={onSubmitUpdate}>
                    {/* left side */}
                    <div className='input-label-form'>
                        <div className='profile_input-container'>
                            <label>First Name: <b>{clientData.first_name}</b></label>
                            <br/>
                            <input 
                            className='input_field'
                            type='text'
                            name='first_name'
                            value={updatedData.first_name}
                            placeholder='Enter first name'
                            onChange={onChangeUpdate}
                            />
                        </div>

                        <div className='profile_input-container'>
                            <label>Last Name: <b>{clientData.last_name}</b></label>
                            <br/>
                            <input 
                            className='input_field'
                            type='text'
                            name='last_name'
                            value={updatedData.last_name}
                            placeholder='Enter last name'
                            onChange={onChangeUpdate}
                            />
                        </div>
                        
                        <div className='profile_input-container'>
                            <label>Email: <b>{clientData.email}</b></label>
                            <br/>
                            <input 
                            className='input_field'
                            type='email'
                            name='email'
                            value={updatedData.email}
                            placeholder='Enter email address '
                            onChange={onChangeUpdate}
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
                            onChange={onChangeUpdate}
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
                            onChange={onChangeUpdate}
                            />
                        </div>
                        }

                        <div className='profile_input-container'>
                            <label>City: <b>{clientData.city}</b></label><br/>
                            <Select 
                                className='dropdown'
                                placeholder="Select a city"
                                //Value for each option (in options object take key:Value )
                                // value={options.filter(obj => )}
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

export default ClientProfileForm;