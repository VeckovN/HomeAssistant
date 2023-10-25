import { city_options } from '../../../../utils/options';
import HouseworkerProfessions from './HouseworkerProfessions';
import HouseworkerInputs from './HouseworkerInputs.js';
import Spinner from '../../../UI/Spinner';

const HouseworkerProfileForm = ({loading, houseworkerData, setHouseworkerData, cityField, register, errors, watch, handleSubmit, getNotOwnedProfessions, onSubmitUpdate, onChangeCityHandler}) =>{
    return(
        <div className='profile-container'>
                {loading ? <Spinner/> :
                <>
                    <h1>Houseworker Profile</h1>
                    <form className='hs-profile-form' onSubmit={handleSubmit(onSubmitUpdate)}>
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
                            <button type='submit'  className='profile-submit'>Update</button>
                        </div>

                    </form>
                </>
                }
            </div>
    )

}

export default HouseworkerProfileForm;