import Select from 'react-select';

const ClientForm = ({data, city_options, options, onSubmit, onChange, onChangeCity, onChangeInterest, onImageChange}) =>{
    return (
        <div className='register_container'>
            <form onSubmit={onSubmit} enctype="multipart/form-data">
            <div className='form_title'>Client Registration</div>
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
                        type='password'
                        name='passwordRepeat'
                        value={data.passwordRepeat}
                        placeholder='Repeat password'
                        onChange={onChange}
                    />
                </div>

                <div className='register_input_container'>
                    <input
                        className='email'
                        type='email'
                        name='email'
                        value={data.email}
                        placeholder='Enter email address'
                        onChange={onChange}
                    />
                </div>

                <div className='register_input_container'>
                    <input
                        className='input_field'
                        type='first_name'
                        name='first_name'
                        value={data.first_name}
                        placeholder='Enter first name'
                        onChange={onChange}
                    />
                </div>

                <div className='register_input_container'>
                    <input
                        className='input_field'
                        type='last_name'
                        name='last_name'
                        value={data.last_name}
                        placeholder='Enter last name'
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

                <label>Profile Picture</label>
                <div class='form-group form-group-image'>
                    <input type="file" onChange={onImageChange}  class='inputFile' name="picture" />
                </div>
                

                <label className='label_input'>Interests</label>
                <Select 
                    className='dropdown'
                    placeholder="Select the professions that interest you"
                    options={options}
                    onChange={onChangeInterest}
                    isMulti
                    isClearable
                />

                <div className ='register_button_container'>
                    <button type='submit' onClick={onSubmit} className='btn'>Register</button>
                </div>

            </form>
        </div>
        
    )
}

export default ClientForm