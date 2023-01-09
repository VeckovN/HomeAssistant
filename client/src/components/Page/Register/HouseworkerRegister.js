import {useState, useEffect} from 'react';

const HouseworkerRegister = () =>{

    const [formData, setFormData] = useState({
        username:'',
        email:'',
        password:'',
        passwordRepeat:'',
        first_name:'',
        last_name:'',
        picture:'',
        gender:'',
        city:'',
        address:'',
        description:'',
        phone_number:''
    })

    const {username, email, password, passwordRepeat, first_name, last_name, picture, city, gender, address, description, phone_number} = formData;

    const onChange = (event) =>{
        const name = event.target.name;
        const value = event.target.value;

        setFormData(prev=> (
            {
                ...prev,
                [name]:value // example first_name:"Novak"
            }
        ))
    }
    
    const onSubmit = (e) =>{
        e.preventDefault();
        alert("HS")

        if(password != passwordRepeat){
            alert("Passwords ins't same");
        }
        else{
            const {password, passwordRepeat, ...otherData} = formData;
            //dispatchRedux action 
            //dispatch(registerClient(formData));
        }
    }

    return (
        <>
            <div className='form'>
                <form onSubmit={onSubmit}>

                    <div className='input_container'>
                        <input
                            className='input_field'
                            type='text'
                            name='username'
                            value={username}
                            placeholder='Enter username'
                            onChange={onChange}
                        />
                    </div>

                    <div className='input_container'>
                        <input
                            className='input_field'
                            type='password'
                            name='password'
                            value={password}
                            placeholder='Enter password'
                            onChange={onChange}
                        />
                    </div>

                    <div className='input_container'>
                        <input
                            className='input_field'
                            type='passwordRepeat'
                            name='passwordRepeat'
                            value={passwordRepeat}
                            placeholder='Repeat password'
                            onChange={onChange}
                        />
                    </div>

                    <div className='input_container'>
                        <input
                            className='input_field'
                            type='first_name'
                            name='first_name'
                            value={first_name}
                            placeholder='Enter first_name'
                            onChange={onChange}
                        />
                    </div>

                    <div className='input_container'>
                        <input
                            className='input_field'
                            type='last_name'
                            name='last_name'
                            value={last_name}
                            placeholder='Enter last_name'
                            onChange={onChange}
                        />
                    </div>

                    <div className='input_container'>
                        <input
                            className='input_field'
                            type='city'
                            name='city'
                            value={city}
                            placeholder='Enter city'
                            onChange={onChange}
                        />
                    </div>

                    <div className='input_container'>
                        <input
                            className='input_field'
                            type='address'
                            name='address'
                            value={address}
                            placeholder='Enter address'
                            onChange={onChange}
                        />
                    </div>

                    <label>Pol</label>
                    <select class="gender" onChange={onChange} name="gender" id='gender'>
                        <option value=""></option>
                        <option value="M">M</option>
                        <option value="Z">Z</option>
                    </select>

                    <div class="multiselect" onclick="ani()">
                    <div class="selectBox" onclick="showCheckboxes()">
                        <select class='select-input'>
                            <option  id='select'>Select jobs:</option>
                        </select>
                        <div class="overSelect"></div>
                        </div>
                        <div id="checkboxes">


                        <div class = "maliProzor">
                        <label for="one"></label>
                            <input type="checkbox" id="one" onclick="ShowHideDiv1(this)" name="jobs[]" value='cistacica'/>Čistačica
                            <input id='cena1' class="input-job" type="number" name="money-cistacica"  placeholder="Cena po satu"/>              
                        </div>


                        <div class = "maliProzor">
                        <label for="two"></label>
                            <input type="checkbox" id="two" onclick="ShowHideDiv2(this)" name="jobs[]" value='dadilja' />Dadilja
                            <input id='cena2' class="input-job" type="number" name="money-dadilja"  placeholder="Cena po satu"/>
                        </div>


                        <div class = "maliProzor">
                        <label for="three"></label>
                            <input type="checkbox" id="three" onclick="ShowHideDiv3(this)" name="jobs[]" value='bastovan' />Baštovan
                            <input id='cena3' class="input-job" type="number" name="money-bastovan"  placeholder="Cena po satu"/>
                        </div>

                        <div class = "maliProzor">
                        <label for="four"></label>
                            <input type="checkbox" id="four" onclick="ShowHideDiv4(this)" name="jobs[]" value='kuvar' />Kuvar
                            <input id='cena4' class="input-job" type="number" name="money-kuvar"  placeholder="Cena po satu"/>
                        </div>

                        <div class = "maliProzor">
                        <label for="five"></label>
                            <input type="checkbox" id="five" onclick="ShowHideDiv5(this)" name="jobs[]" value='staratelj' />Staratelj
                            <input id='cena5' class="input-job" type="number" name="money-staratelj"  placeholder="Cena po satu"/>
                        </div>

                        <div class = "maliProzor">
                        <label for="six"></label>
                            <input type="checkbox" id="six" onclick="ShowHideDiv6(this)" name="jobs[]" value='sobarica' />Sobarica
                            <input id='cena6' class="input-job" type="number" name="money-sobarica"  placeholder="Cena po satu"/>
                        </div>

                        <div class = "maliProzor">
                        <label for="seven"></label>
                            <input type="checkbox" id="seven" onclick="ShowHideDiv7(this)" name="jobs[]" value='domacica' />Domacica
                            <input id='cena7' class="input-job" type="number" name="money-domacica"  placeholder="Cena po satu"/>
                        </div>
                    
                    </div>
                </div>

                    <label>Opis</label>
                    <textarea onClick={onChange} rows="5" cols="20" class="descBox" id='desc' name="description"></textarea>

                    <div className ='button_container'>
                        <button type='submit' onClick={onSubmit} className='btn'>Submit</button>
                    </div>

                </form>
            </div>
        
        
        </>
    )

}

export default HouseworkerRegister