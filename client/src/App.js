import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Home from './components/Page/Home';
import Header from './components/Layout/Header/Header.js'
import Register from './components/Page/Register/Register.js'
import ClientRegister from './components/Page/Register/ClientRegister';
import HouseworkerRegister from './components/Page/Register/HouseworkerRegister';
import Login from './components/Page/Login/Login.js'
import Comments from './components/Page/Houseworker/CommentsList';
import Profile from './components/Page/Profile';
import Messages from './components/Page/Messages/Messages'

import {ToastContainer, toast} from 'react-toastify';
//css class for custom style
import './toastify.css'

import {io} from "socket.io-client";

import useSocket from './hooks/useSocket';
import { useSelector } from 'react-redux';
//import Toastify Css
import 'react-toastify/dist/ReactToastify.min.css';


// const socketIO = io("http://127.0.0.1:5000", {
//   withCredentials: true,
// });

function App() {

  const {user} = useSelector((state) => state.auth)
  // if(!user)
    
  const [socket, connected] = useSocket(user);
  // const socket = io("http://127.0.0.1:5000", {
  //   withCredentials: true,
  // });

  return (
    <BrowserRouter>
      {/* <div className="App_container">     */}
        <Header />
        {/* Context(Home.js) */}
        <Home socket={socket} connected={connected} />
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
          <Route path='/messages' element={<Messages socket={socket} connected={connected}/>}></Route>        

        </Routes>
        {/* IN THIS HOME WE HAVE MORE ROUTES  */}
        {/* Footer */}
        <ToastContainer/>
      {/* </div> */}

    </BrowserRouter>

  );
}

export default App;
