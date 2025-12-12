import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login from './Components/Login/Login'
import './App.css'
import Home from './Components/Home/Home'
import ResponseModal from './Components/Modals/ResponseModal'
import Header from './Components/Header/Header'
import Departments from './Components/MenuElement/Departments'
import Units from './Components/MenuElement/Units'
import AccountTypes from './Components/MenuElement/AccountTypes'
import Ranks from './Components/MenuElement/Ranks'
import Accounts from './Components/MenuElement/Accounts'
import Duties from './Components/MenuElement/Duties/Duties'
import Loggins from './Components/Loggins/Loggins'
import CreateAdminAccount from './Components/MenuElement/Duties/CreateAdminAccount'
import RequestUsers from './Components/UsersRequest/RequestUsers'

function App() {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem("myUserDutyToken"));
  const [userInfo, setUserInfo] = useState(null);
  const [item, setItem] = useState({});
  const [showCreate, setShowCreate] = useState(true);
  const [connectNow, setConnectNow] = useState(null);

  const [responseRequest, setResponseRequest] = useState({
    showResponse: false,
    isQuestion: false,
    title: "",
    message: "",
    onConfirm: null,
    type: "",
    api: ""
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const currentToken = localStorage.getItem("myUserDutyToken");
      if (token !== currentToken) {
        setToken(currentToken);
        if (!currentToken) navigate("/login", { replace: true });
      }
    }, 100);
    return () => clearInterval(interval);
  }, [token, navigate]);

  return (
    <>
      {
        token && <Header userInfo={userInfo} setUserInfo={setUserInfo} setResponseRequest={setResponseRequest}
          connectNow={connectNow}
          setConnectNow={setConnectNow} />
      }
      <Routes>
        {token ? (
          <>
            <Route path="/" element={<Home />} />
            <Route path='/departments' element={<Departments
              setResponseRequest={setResponseRequest} setItem={setItem} item={item} />} />
            <Route path='/units' element={<Units
              setResponseRequest={setResponseRequest} setItem={setItem} item={item} />} />
            <Route path='/account-types' element={<AccountTypes
              setResponseRequest={setResponseRequest} userInfo={userInfo} setItem={setItem} item={item} />} />
            <Route path='/ranks' element={<Ranks
              setResponseRequest={setResponseRequest} userInfo={userInfo} setItem={setItem} item={item} />} />
            <Route path='/accounts' element={<Accounts
              setResponseRequest={setResponseRequest} userInfo={userInfo} setItem={setItem} item={item} />} />
            <Route path='/shift-managers' element={<Duties
              setResponseRequest={setResponseRequest} userInfo={userInfo} setItem={setItem} item={item} />} />
            <Route path='/operation-history' element={<Loggins
              setResponseRequest={setResponseRequest} userInfo={userInfo} setItem={setItem} item={item} />} />
            <Route path='/users-request' element={<RequestUsers
              setResponseRequest={setResponseRequest} userInfo={userInfo} setItem={setItem} item={item} connectNow={connectNow} />} />
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/create-admin-page" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          <>
            <Route path="/login" element={<Login />} />
            {
              showCreate && (
                <Route path="/create-admin-page" element={<CreateAdminAccount
                  setShowCreate={setShowCreate}
                  setResponseRequest={setResponseRequest} />}
                />
              )
            }

            <Route path="*" element={<Navigate to="/login" replace />} />
          </>
        )}
      </Routes>
      {
        responseRequest.showResponse && (
          <ResponseModal responseRequest={responseRequest} setResponseRequest={setResponseRequest} />
        )
      }
    </>
  )
}

export default App