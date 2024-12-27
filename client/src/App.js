import {BrowserRouter, Routes, Route} from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { requestInterceptor } from './utils/AxiosInterceptors.js';
import useSocket from './hooks/useSocket';

import Register from './pages/Register/Register.js'
import ClientRegister from './pages/Register/Client/ClientRegister.js';
import HouseworkerRegister from './pages/Register/Houseworker/HouseworkerRegister.js';
import Login from './pages/Login/Login.js';
import Comments from './pages/CommentsList.js';

import ClientProfile from './pages/Profile/ClientProfile/ClientProfile.js';
import HouseworkerProfile from './pages/Profile/HouseworkerProfile/HouseworkerProfile.js';
import Messages from './pages/Messages.js';
import NotFound from './pages/NotFound.js';
import HouseworkerHome from './pages/Home/HouseworkerHome.js';
import ClientHome from './pages/Home/ClientHome.js';
import Sidebar from './components/Layout/Sidebar.js';
import ClientLayout from './components/Layout/ClientLayout.js';

import PrivateRoute from './utils/Route/PrivateRoute.js';
import NotAuthRoute from './utils/Route/NotAuthRoute.js';
import ScrollToTopWrapper from './utils/ScrollToTopWrapper.js';
import NotificationWrapper from './utils/NotificationWrapper.js';

import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import './toastify.css'

function App() {
  const {user} = useSelector((state) => state.auth) 
  const [socket, connected] = useSocket(user);
  const dispatch = useDispatch();
  requestInterceptor(dispatch);

  return (
  <BrowserRouter>
    <NotificationWrapper>
      <ScrollToTopWrapper>
        <Routes>

        {(user?.type === "Client" || user == null) && (
          <Route element={<ClientLayout/>}>
            <Route index path="/" element={<ClientHome socket={socket} />} />
            <Route path="/login" element={<NotAuthRoute><Login/></NotAuthRoute>} />
            <Route path="/register" element={<NotAuthRoute><Register/></NotAuthRoute>} />
            <Route path="/clientRegister" element={<NotAuthRoute><ClientRegister /></NotAuthRoute>} />
            <Route path="/HouseworkerRegister" element={<NotAuthRoute><HouseworkerRegister/></NotAuthRoute>} />
            {/* <Route path="/profile" element={<PrivateRoute><Profile/></PrivateRoute>} /> */}
            <Route path="/profile" element={<PrivateRoute><ClientProfile/></PrivateRoute>} />
            <Route path="/messages" element={<PrivateRoute><Messages socket={socket} connected={connected}/></PrivateRoute>} />
            <Route path="*" element={<NotFound/>} />
          </Route>
        )}

        {user?.type === "Houseworker" && (
          <Route element={<Sidebar/>} >
            <Route index path="/" element={<PrivateRoute><HouseworkerHome/></PrivateRoute>} />
            <Route path="/messages" element={<PrivateRoute><Messages socket={socket} connected={connected}/></PrivateRoute>} />
            <Route path="/comments" element={<PrivateRoute privacy='houseworker'><Comments socket={socket} user={user}/></PrivateRoute>} />
            {/* <Route path="/profile" element={<PrivateRoute><Profile/></PrivateRoute>} /> */}
            <Route path="/profile" element={<PrivateRoute><HouseworkerProfile/></PrivateRoute>} />
            <Route path="/login" element={<NotAuthRoute><Login/></NotAuthRoute>} />
            <Route path="*" element={<NotFound/>} />
          </Route>
        )}

        </Routes>
      
      <ToastContainer/>
      </ScrollToTopWrapper>
    </NotificationWrapper>

  </BrowserRouter>
  )

}

export default App;
