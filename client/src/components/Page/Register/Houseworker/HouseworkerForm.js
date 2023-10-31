import Select from 'react-select';
import FormInput from '../../../../utils/FormInput';
import FormSelect from '../../../../utils/FormSelect';

// import '../Register.css';
import '../../../../sass/pages/Register/_registerUser.scss';

const HouseworkerForm = ({register, errors, getValues, cityField, professionField, avatarField, handleSubmit, onRemoveAvatarHanlder, onChangeHouseworkerProfessionsHandler, onChangeProffesionsHandler, onChangeImageHandler, onChangeCityHandler, onSubmitHandler,  profession_options, city_options}) =>{

    const inputs =[{id:'1', name:'username', type:'text', label:"Username"}, {id:'2', name:'email' , type:'text', label:"Email", autoComplete:"off"}, {id:'3',name:'password', type:'password', label:"Password", autoComplete:"new-password"}, {id:'4',name:'confirmPassword', type:'password', label:"Confirm Password", autoComplete:"new-password"}, 
    {id:'5',name:'firstName' , type:'text', label:"First Name", placeholder:"Enter first name"}, {id:'6',name:'lastName', type:'text', label:"Last name", placeholder:"Enter last name"}, {id:'7', name:'age' , type:'text', label:"Age"}, {id:'8', name:'address' , type:'text', label:"Address"}, {id:'9', name:'phoneNumber' , type:'text', label:"Phone number", placeholder:"Enter phone number"}]

    return (
        <div className='register-user-container'>
            {/* <div className='form-title'>Houseworker registration</div> */}
            <form className='houseworker-form' onSubmit ={handleSubmit(onSubmitHandler)} encType="multipart/form-data">
                <div className='form-title'>Houseworker registration</div>

                <div className='form-inputs'>
                    <div className='register-box inputs'>
                        {inputs.map(el => {
                            return(
                            <div className='register-box-input'>
                                <label className='input-lab'>{el.label}</label>
                                <div className='register-input-container' key={el.id}>
                                    <FormInput 
                                        type={el.type}
                                        name={el.name}
                                        placeholder={el.placeholder}
                                        autoComplete={el.autoComplete}
                                        register={register} 
                                        errors={errors}
                                    />
                                </div>
                            </div>
                            )
                        })}
                    </div>

                    <div className='register-box selectors'>
                        <div className='city-container'>
                            <FormSelect
                                placeholder="Select a city"
                                title="City"
                                options={city_options}
                                onChangeHandler={onChangeCityHandler}
                                formFieldValue={cityField.value}
                                errorsMessage={errors.city?.message}
                            />
                        </div>

                        <div className='gender-container'>
                            <label className='label-input'>Gender</label>
                            <select className="gender-option" {...register('gender')}>
                                <option value="">Choose gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                            <div className='input-error'>{errors.gender?.message}</div>
                        </div>

                        <div className='avatar-container'>
                            <label className='label-input'>Profile Avatar</label>
                            <div className='form-group form-group-image'>
                                <input 
                                    className='inputFile' 
                                    type="file" 
                                    // name="picture"
                                    onChange={onChangeImageHandler}  
                                />
                                <div className='image_place'>
                                    {avatarField.value && (
                                        <div className='image_container'>
                                            <img
                                                src={URL.createObjectURL(avatarField.value)}
                                                alt="avatar"
                                            />
                                            <button onClick={onRemoveAvatarHanlder} className='removeImageButton'>
                                                Remove Image
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className='input-error'>{errors.avatar?.message}</div>
                            </div>
                        </div>

                        <div className='professions-container'>
                            <FormSelect
                                placeholder="Select the professions"
                                title="Professions"
                                options={profession_options}
                                onChangeHandler={onChangeProffesionsHandler}
                                formFieldValue={professionField.value}
                                errorsMessage={errors.professions?.message}
                                isMulti
                            />
                        </div>

                        <div className='working-hour-container'>
                            {  //list profession
                                // data.professions.map((el,index) => (
                                //getValues.professions
                                getValues('professions')?.map((el,index) => (    
                                <div className='working-hours' key={index}>
                                    <label><b>{el}</b></label>
                                    <input 
                                        className='input-field'
                                        type='number'
                                        placeholder="Enter working hour"
                                        name={el} //selected profession
                                        // value //entered value
                                        onChange={onChangeHouseworkerProfessionsHandler}
                                    />
                                    <div className='input-error'>{errors?.houseworkerProfessions?.[index]?.working_hour}</div>
                                    <div className='input-error'>{errors?.houseworkerProfessions?.working_hour}</div>
                                </div>    
                                ))
                            }
                        </div>
                        <br/>
                
                        <div className='desc-container'>
                            <label className='label-input'>Description</label>
                            <textarea 
                                className="description-box"  
                                rows="5" 
                                cols="20" 
                                {...register('description')}
                            />
                            <div className='input-error'>{errors.description?.message}</div>
                        </div>
                    </div>
                </div>


                <div className ='register-button-container'>
                    <button type='submit'className='btn'>Register</button>
                </div>

            </form>
        </div>
    )

}

export default HouseworkerForm