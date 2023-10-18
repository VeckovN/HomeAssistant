import { city_options } from '../../../../utils/options';
import HouseworkerProfessions from './HouseworkerProfessions';
import HouseworkerInputs from './HouseworkerInputs.js';

const HouseworkerProfileForm = ({houseworkerData, setHouseworkerData, cityField, register, errors, watch, handleSubmit, getNotOwnedProfessions, onSubmitUpdate, onChangeCityHandler}) =>{
    return(
        <div className='profile_container'>
                <h1>Houseworker Profile</h1>
                <form className='profile_form' onSubmit={handleSubmit(onSubmitUpdate)}>
                    <div className ='professions'>
                        <HouseworkerProfessions
                            houseworkerData={houseworkerData}
                            setHouseworkerData={setHouseworkerData}
                            getNotOwnedProfessions={getNotOwnedProfessions}
                        />
                    </div>
                    <div className='input-label-form'>
                        <HouseworkerInputs
                            houseworkerData={houseworkerData}
                            register={register}
                            errors={errors}
                            watch={watch}
                            cityField={cityField}
                            city_options={city_options}
                            onChangeCityHandler={onChangeCityHandler}
                        />
                        <br></br>
                        <button type='submit'  className='profile_submit'>Update</button>
                    </div>

                </form>
            </div>
    )

}

export default HouseworkerProfileForm;