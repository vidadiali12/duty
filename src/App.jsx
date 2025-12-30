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
import Footer from './Components/Footer/Footer'
import CompletedTasks from './Components/MenuElement/CompletedTasks/CompletedTasks'
import TaskTypeAndTitleAdmin from './Components/MenuElement/CompletedTasks/TaskTypeAndTitleAdmin'
import Roles from './Components/MenuElement/Roles/Roles'
import Order from './Components/MenuElement/Statistika/Order'
import Statistics from './Components/MenuElement/Statistics/Statistics'
import ActionCountPage from './Components/MenuElement/HistoryPanel/ActionCountPage'
import Summary from './Components/MenuElement/Summary/Summary'

function App() {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem("myUserDutyToken"));
  const [userInfo, setUserInfo] = useState(null);
  const [item, setItem] = useState({});
  const [showCreate, setShowCreate] = useState(true);
  const [connectNow, setConnectNow] = useState(null);
  const [permissionIdsList, setPermissionIdsList] = useState(null)

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
        if (!currentToken) navigate("/login-page", { replace: true });
      }
    }, 100);
    return () => clearInterval(interval);
  }, [token, navigate]);

  return (
    <>
      <div className='root-child'>
        {
          token && <Header userInfo={userInfo} setUserInfo={setUserInfo} setResponseRequest={setResponseRequest}
            permissionIdsList={permissionIdsList} setPermissionIdsList={setPermissionIdsList}
            connectNow={connectNow}
            setConnectNow={setConnectNow} />
        }
        <Routes>
          {token ? (
            <>
              <Route path="/" element={<Home
                userInfo={userInfo}
                setUserInfo={setUserInfo}
                setResponseRequest={setResponseRequest} permissionIdsList={permissionIdsList} />} />

              <Route path='/departments' element={<Departments
                setResponseRequest={setResponseRequest} setItem={setItem} item={item} permissionIdsList={permissionIdsList} />} />
              <Route path='/units' element={<Units
                setResponseRequest={setResponseRequest} setItem={setItem} item={item} permissionIdsList={permissionIdsList} />} />
              <Route path='/account-types' element={<AccountTypes
                setResponseRequest={setResponseRequest} userInfo={userInfo} setItem={setItem} item={item} permissionIdsList={permissionIdsList} />} />
              <Route path='/ranks' element={<Ranks
                setResponseRequest={setResponseRequest} userInfo={userInfo} setItem={setItem} item={item} permissionIdsList={permissionIdsList} />} />
              <Route path='/accounts' element={<Accounts
                setResponseRequest={setResponseRequest} userInfo={userInfo} setItem={setItem} item={item} permissionIdsList={permissionIdsList} />} />
              <Route path='/shift-managers' element={<Duties
                setResponseRequest={setResponseRequest} userInfo={userInfo} setItem={setItem} item={item} permissionIdsList={permissionIdsList} />} />
              <Route path='/operation-history' element={<Loggins
                setResponseRequest={setResponseRequest} userInfo={userInfo} setItem={setItem} item={item} permissionIdsList={permissionIdsList} />} />
              <Route path='/users-request' element={<RequestUsers
                setResponseRequest={setResponseRequest} userInfo={userInfo} setItem={setItem} item={item} connectNow={connectNow} permissionIdsList={permissionIdsList} />} />
              <Route path='/completed-tasks' element={<CompletedTasks
                setResponseRequest={setResponseRequest} userInfo={userInfo} setItem={setItem} item={item} permissionIdsList={permissionIdsList} />} />
              <Route path='/task-area' element={<TaskTypeAndTitleAdmin
                setResponseRequest={setResponseRequest} userInfo={userInfo} setItem={setItem} item={item} permissionIdsList={permissionIdsList} />} />
              <Route path='/permissions' element={<Roles
                setResponseRequest={setResponseRequest} userInfo={userInfo} setItem={setItem} item={item} permissionIdsList={permissionIdsList} />} />
              <Route path='/orders' element={<Order
                setResponseRequest={setResponseRequest} userInfo={userInfo} setItem={setItem} item={item} permissionIdsList={permissionIdsList} />} />
              <Route path='/statistics-page' element={<Statistics
                setResponseRequest={setResponseRequest} userInfo={userInfo} setItem={setItem} item={item} permissionIdsList={permissionIdsList} />} />
              <Route path='/history-panel' element={<ActionCountPage
                setResponseRequest={setResponseRequest} userInfo={userInfo} setItem={setItem} item={item} permissionIdsList={permissionIdsList} />} />
              <Route path='/summary' element={<Summary
                setResponseRequest={setResponseRequest} userInfo={userInfo} setItem={setItem} item={item} permissionIdsList={permissionIdsList} />} />
              <Route path="/login-page" element={<Navigate to="/" replace />} />
              <Route path="/create-admin-page" element={<Navigate to="/" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          ) : (
            <>
              <Route path="/login-page" element={<Login />} />
              {
                showCreate && (
                  <Route path="/create-admin-page" element={<CreateAdminAccount
                    setShowCreate={setShowCreate}
                    setResponseRequest={setResponseRequest} />}
                  />
                )
              }
              <Route path="*" element={<Navigate to="/login-page" replace />} />
            </>
          )}
        </Routes>
      </div>
      <Footer />
      {
        responseRequest.showResponse && (
          <ResponseModal responseRequest={responseRequest} setResponseRequest={setResponseRequest} />
        )
      }
    </>
  )
}

export default App