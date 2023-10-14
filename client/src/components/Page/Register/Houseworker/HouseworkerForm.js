import Select from 'react-select';
import RegisterInput from '../RegisterInput';

const HouseworkerForm = ({register, errors, getValues, cityField, professionField, handleSubmit, onChangeHouseworkerProfessionsHandler, onChangeProffesionsHandler, onChangeImageHandler, onChangeCityHandler, onSubmitHandler,  profession_options, city_options}) =>{

    const inputs =[{id:'1', name:'username', type:'text'}, {id:'2', name:'email' , type:'text'}, {id:'3',name:'password', type:'password'}, {id:'4',name:'confirmPassword', type:'password'}, 
    {id:'5',name:'firstName' , type:'text', placeholder:"Enter first name"}, {id:'6',name:'lastName', type:'text', placeholder:"Enter last name"}, {id:'7', name:'age' , type:'text'}, {id:'8', name:'address' , type:'text'}, {id:'9', name:'phoneNumber' , type:'text', placeholder:"Enter phone number"}]

    return (
        <div className='register_container'>
                <form onSubmit ={handleSubmit(onSubmitHandler)} encType="multipart/form-data">
                <div className='form_title'>Houseworker registration</div>
                
                    {inputs.map(el => {
                        return<div className='register_input_container' key={el.id}>
                            <RegisterInput 
                                type={el.type}
                                name={el.name}
                                placeholder={el.placeholder}
                                register={register} 
                                errors={errors}
                            />
                        </div>
                    })}

                    <br></br>
                    <Select 
                        className='dropdown'
                        placeholder="Select a city"
                        value={city_options.find(({value}) => value === cityField.value)}
                        options={city_options}
                        onChange={onChangeCityHandler}
                        isClearable
                    />
                    <div className='input_errors'>{errors.city?.message}</div>

                    <label className='label_input'>Gender</label>
                    <select className="gender_option" {...register('gender')}>
                        <option value="">Choose gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>
                    <div className='input_errors'>{errors.gender?.message}</div>

                    <label className='label_input'>Profile Avatar</label>
                    <div className='form-group form-group-image'>
                        <input 
                            className='inputFile' 
                            type="file" 
                            // name="picture"
                            onChange={onChangeImageHandler}  
                        />
                        <div className='input_errors'>{errors.avatar?.message}</div>
                    </div>

                    <br/>

                    <label className='label_input'>Professions</label>
                    <Select 
                        className='dropdown'
                        placeholder="Select the Profession"
                        options={profession_options}
                        value={profession_options.find(({value}) => value === professionField.value)}
                        onChange={onChangeProffesionsHandler}
                        isMulti
                        isClearable
                    />
                    <div className='input_errors'>{errors.professions?.message}</div>
                    
                    {  //list profession
                        // data.professions.map((el,index) => (
                        //getValues.professions
                        getValues('professions')?.map((el,index) => (    
                        <div key={index}>
                            <label><b>{el}</b></label>
                            <input 
                                className='input_field'
                                type='number'
                                placeholder={`Enter working hour`} 
                                name={el} //selected profession
                                // value //entered value
                                onChange={onChangeHouseworkerProfessionsHandler}
                            />
                            <div className='input_errors'>{errors?.houseworkerProfessions?.[index]?.working_hour}</div>
                            <div className='input_errors'>{errors?.houseworkerProfessions?.working_hour}</div>
                        </div>    
                        ))
                    }
                    <br/>
            
                    <label className='label_input'>Description</label>
                    <textarea 
                        className="descriptionBox"  
                        rows="5" 
                        cols="20" 
                        {...register('description')}
                    />
                    <div className='input_errors'>{errors.description?.message}</div>

                    <div className ='register_button_container'>
                        <button type='submit'className='btn'>Register</button>
                    </div>

                </form>
            </div>
    )

}

export default HouseworkerForm