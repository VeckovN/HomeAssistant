import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import Home from './components/Page/Home';
import Header from './components/Layout/Header/Header.js'
import Register from './components/Page/Register/Register.js'
import ClientRegister from './components/Page/Register/Client/ClientRegister';
import HouseworkerRegister from './components/Page/Register/Houseworker/HouseworkerRegister';
import Login from './components/Page/Login/Login.js'
import Comments from './components/Page/Houseworker/CommentsList/CommentsList.js';
import Profile from './components/Page/Profile';
import Messages from './components/Page/Messages/Messages'
import PrivateRoute from './utils/PrivateRoute';
import NotFound from './components/Page/NotFound.js';

import {ToastContainer, toast} from 'react-toastify';
//css class for custom style
import './toastify.css'

import useSocket from './hooks/useSocket';
import { useSelector, useDispatch } from 'react-redux';
//import Toastify Css
import 'react-toastify/dist/ReactToastify.min.css';

import { requestInterceptor } from './utils/AxiosInterceptors.js';

// const socketIO = io("http://127.0.0.1:5000", {
//   withCredentials: true,
// });

function App() {

  const {user} = useSelector((state) => state.auth)    
  const [socket, connected] = useSocket(user);
  const dispatch = useDispatch();

  requestInterceptor(dispatch);

  return (
    <BrowserRouter>
      {/* <div className="App_container">     */}
        <Header/>
        <Routes>
          <Route path='/' element={<Home socket={socket} connected={connected} user={user}/>}> </Route>
          <Route path='/login' element={<Login/>}></Route>
          <Route path='/register' element={<Register/>}></Route>
          <Route path='/clientRegister' element={<ClientRegister />}></Route>
          <Route path='/HouseworkerRegister' element={<HouseworkerRegister/>}></Route>
        
          <Route path='/comments' element={
              <PrivateRoute privacy='houseworker'>
                <Comments/>
              </PrivateRoute>
            }
          />
         <Route path='/profile' element={
              <PrivateRoute >
                <Profile/> 
              </PrivateRoute>
            }
          />

          <Route path='/messages' element={
              <PrivateRoute >
                <Messages socket={socket} connected={connected}/>
              </PrivateRoute>
            }
          />

          <Route path="*" element ={<NotFound/>}></Route> 

        </Routes>
        {/* IN THIS HOME WE HAVE MORE ROUTES  */}
        {/* Footer */}
        <ToastContainer/>
      {/* </div> */}

    </BrowserRouter>

  );
}

export default App;
