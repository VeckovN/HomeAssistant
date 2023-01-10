import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Home from './components/Page/Home';
import Header from './components/Layout/Header/Header.js'
import Register from './components/Page/Register/Register.js'
import ClientRegister from './components/Page/Register/ClientRegister';
import HouseworkerRegister from './components/Page/Register/HouseworkerRegister';
import Login from './components/Page/Login/Login.js'
import Comments from './components/Page/Houseworker/CommentsList';
import Profile from './components/Page/Profile';

import {ToastContainer} from 'react-toastify';
//import Toastify Css
import 'react-toastify/dist/ReactToastify.min.css';

function App() {
  return (

    <BrowserRouter>
      <div className="App">    
        <Header />
        {/* Context(Home.js) */}
        <Home />
        <Routes>
          <Route path='/login' element={<Login/>}></Route>
          <Route path='/register' element={<Register/>}></Route>
          {/* // one solution to create 2 modals in /register (for Client and for Houseworker register)
          // second soluction  that /register is modal and /clientRegister and houseowrkerRgister pages  */}
          <Route path='/clientRegister' element={<ClientRegister/>}></Route>
          <Route path='/HouseworkerRegister' element={<HouseworkerRegister/>}></Route>
          
          {/* Houseworker */}
          {/* <Route path='/houseworker'>
            <Route path='/comments' element={<Comments/>}></Route>
            <Route path='/profile' element={<Profile/>}></Route>
          </Route> */}
          <Route path='/comments' element={<Comments/>}></Route>
          <Route path='/profile' element={<Profile/>}></Route>
          

        </Routes>
        
        {/* IN THIS HOME WE HAVE MORE ROUTES  */}

        {/* Footer */}

        <ToastContainer/>
      </div>
    </BrowserRouter>

  );
}

export default App;
