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
import Logs from './Components/MenuElement/Logs/Logs'

function App() {
  const navigate = useNavigate()
  const [token, setToken] = useState(localStorage.getItem("myUserDutyToken"))
  const [userInfo, setUserInfo] = useState(null)
  const [item, setItem] = useState({})

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
    const check = () => {
      const t = localStorage.getItem("myUserDutyToken")
      setToken(t)
      if (!t) navigate("/login", { replace: true })
    }
    window.addEventListener("storage", check)
    const interval = setInterval(check, 300)
    return () => {
      window.removeEventListener("storage", check)
      clearInterval(interval)
    }
  }, [navigate])

  return (
    <>
      {
        token && <Header userInfo={userInfo} setUserInfo={setUserInfo} setResponseRequest={setResponseRequest} />
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
            <Route path='/operation-history' element={<Logs
              setResponseRequest={setResponseRequest} userInfo={userInfo} setItem={setItem} item={item} />} />
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        ) : (
          <>
            <Route path="/login" element={<Login />} />
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