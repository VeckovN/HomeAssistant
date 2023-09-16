import Select from 'react-select';

const HouseworkerForm = ({data, profession_options, city_options, onSubmit, onChange, onChangeCity, onImageChange, onChangeProffesions, onChangeHouseworkerProfessions}) =>{

    return (
        <div className='register_container'>
                <form>
                <div className='form_title'>Houseworker registration</div>
                    <div className='register_input_container'>
                        <input
                            className='input_field'
                            type='text'
                            name='username'
                            value={data.username}
                            placeholder='Enter username'
                            onChange={onChange}
                        />
                    </div>

                    <div className='register_input_container'>
                        <input
                            className='input_field'
                            type='text'
                            name='email'
                            value={data.email}
                            placeholder='Enter email address'
                            onChange={onChange}
                        />
                    </div>

                    <div className='register_input_container'>
                        <input
                            className='input_field'
                            type='password'
                            name='password'
                            value={data.password}
                            placeholder='Enter password'
                            onChange={onChange}
                        />
                    </div>

                    <div className='register_input_container'>
                        <input
                            className='input_field'
                            type='passwordRepeat'
                            name='passwordRepeat'
                            value={data.passwordRepeat}
                            placeholder='Repeat password'
                            onChange={onChange}
                        />
                    </div>

                    <div className='register_input_container'>
                        <input
                            className='input_field'
                            type='text'
                            name='first_name'
                            value={data.first_name}
                            placeholder='Enter first name'
                            onChange={onChange}
                        />
                    </div>

                    <div className='register_input_container'>
                        <input
                            className='input_field'
                            type='text'
                            name='last_name'
                            value={data.last_name}
                            placeholder='Enter last name'
                            onChange={onChange}
                        />
                    </div>

                    <div className='register_input_container'>
                        <input
                            className='input_field'
                            type='number'
                            name='age'
                            value={data.age}
                            placeholder='Enter age'
                            onChange={onChange}
                        />
                    </div>

                    <div className='register_input_container'>
                        <input
                            className='input_field'
                            type='address'
                            name='address'
                            value={data.address}
                            placeholder='Enter address'
                            onChange={onChange}
                        />
                    </div>
                    <div className='register_input_container'>
                        <input
                            className='input_field'
                            type='number'
                            name='phone_number'
                            value={data.phone_number}
                            placeholder='Enter phone number'
                            onChange={onChange}
                        />
                    </div>

                    <br></br>
                    <Select 
                        className='dropdown'
                        placeholder="Select a city"
                        options={city_options}
                        onChange={onChangeCity}
                        isClearable
                    />

                    <label className='label_input'>Gender</label>
                    <select className="gender_option" onChange={onChange} name="gender" id='gender'>
                        <option value="">Choose gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>

                    <label className='label_input'>Profile picture</label>
                    <div className='form-group form-group-image'>
                        <input type="file" onChange={onImageChange}  className='inputFile' name="picture" />
                    </div>

                    <br/>
                    <Select 
                        className='dropdown'
                        placeholder="Select Profession"
                        options={profession_options}
                        onChange={onChangeProffesions}
                        isMulti
                        isClearable
                    />
                    
                    {  //list profession
                        data.professions.map((el,index) => (
                        <div key={index}>
                            <label><b>{el}</b></label>
                            <input 
                                className='input_field'
                                type='number'
                                name={el} //selected profession
                                // value //entered value
                                placeholder={`Enter ${el} working hour`} 
                                onChange={onChangeHouseworkerProfessions}
                            />
                        </div>    
                        ))
                    }
                    <br/>
                    

                    <label className='label_input'>Description</label>
                    <textarea onChange={onChange} rows="5" cols="20" className="descriptionBox"  name="description"></textarea>

                    <div className ='register_button_container'>
                        <button type='submit' onClick={onSubmit} className='btn'>Register</button>
                    </div>

                </form>
            </div>
    )

}

export default HouseworkerForm