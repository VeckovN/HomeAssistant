// import ClockLoader from 'react-spinners/ClockLoader'
// import HashLoader from 'react-spinners/HashLoader'
import PuffLoader from 'react-spinners/PuffLoader'

const override = {
    display: "block",
    margin : "0 auto",
}
const Spinner = ({className}) =>{
    return (
        <div className={className}>
            <PuffLoader
                // color="rgba(180, 240, 250, 1)"
                color="rgba(120, 240, 250, 1)"
                cssOverride={override}
                speedMultiplier={2}
            /> 
        </div>
    )
}

export default Spinner;