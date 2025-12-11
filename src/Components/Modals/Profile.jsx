import './Profile.css'
import { useEffect, useState } from 'react'
import { FaUserCircle, FaEye, FaEyeSlash } from 'react-icons/fa'
import { MdAdminPanelSettings } from 'react-icons/md'
import api from '../../api'

const Profile = ({ userInfo, setUserInfo, setShowProfile, setResponseRequest }) => {
  const [passwordData, setPasswordData] = useState({
    oldPass: '',
    newPass: '',
    confirmPass: ''
  })

  const [showPassword, setShowPassword] = useState({
    oldPass: false,
    newPass: false,
    confirmPass: false
  })

  const [shouldChangePassword, setShouldChangePassword] = useState(null)

  const [loading, setLoading] = useState(null)

  const closeProfile = () => setShowProfile(null)

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({ ...prev, [name]: value }))
  }

  const toggleShowPassword = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPass.trim() == "" || passwordData.confirmPass.trim() == "" || passwordData.oldPass.trim() == "") {
      setResponseRequest(prev => ({
        ...prev,
        showResponse: true,
        title: "❌ Sahələr doldurulmalıdır",
        isQuestion: false
      }));
      return;
    }
    if (passwordData.newPass !== passwordData.confirmPass) {
      setResponseRequest(prev => ({
        ...prev,
        showResponse: true,
        title: "❌ Parol və təkrarı uyğun gəlmir",
        isQuestion: false
      }));
      return;
    }

    if (
      passwordData.confirmPass.trim().length < 8 ||
      !/[a-z]/.test(passwordData.confirmPass.trim()) ||
      !/[A-Z]/.test(passwordData.confirmPass.trim()) ||
      !/[^A-Za-z0-9]/.test(passwordData.confirmPass.trim())
    ) {
      throw new Error(
        `❌ "Şifrə tələblərə cavab vermir! Şifrə ən az 8 simvoldan ibarət olmalı, böyük, kiçik hərf və simvol daxil etməlidir."`
      );
    }


    try {
      setLoading(true);
      const token = localStorage.getItem("myUserDutyToken");

      if (!token) throw new Error("❌ Token tapılmadı");

      if (!userInfo) throw new Error("❌ User məlumatları tapılmadı");

      const requestDataJson = {
        username: userInfo?.username,
        oldPassword: passwordData?.oldPass,
        newPassword: passwordData?.confirmPass
      };

      const response = await api.put(
        '/auth/changePassword',
        requestDataJson,
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );

      const responseData = response?.data?.data
      console.log(responseData)
      localStorage.setItem("myUserDutyToken", responseData?.accessToken);
      localStorage.setItem("tokenExpiration", responseData?.tokenExpDate);

      setResponseRequest(prev => ({
        ...prev,
        showResponse: true,
        message: "Parol uğurla yeniləndi ✅",
        isQuestion: false,
        type: 'changeMyPass'
      }));

      setLoading(false);

      if (userInfo?.shouldChangePassword) {
        localStorage.clear();
      }

    } catch (err) {
      setResponseRequest(prev => ({
        ...prev,
        showResponse: true,
        title: "Xəta baş verdi ❌",
        message: err?.response?.data?.errorDescription || err,
        isQuestion: false
      }));
      setLoading(false);
    }
  };


  const callUser = () => {
    console.log(userInfo)
    setShouldChangePassword(userInfo?.shouldChangePassword);
  }

  useEffect(() => {
    callUser()
  }, [])


  return (
    <div className={`profile-page ${shouldChangePassword ? 'dark-profile' : ''}`}>
      <div className="profile-card-row">
        {
          !shouldChangePassword && (
            <div className="profile-info-card">
              <button className="close-btn-profile" onClick={closeProfile}>✖</button>
              <div className="avatar"><FaUserCircle className="avatar-icon" /></div>
              <h2 className="username">{userInfo?.person?.name} {userInfo?.person?.surname}</h2>
              <p className="position">{userInfo?.person?.position}</p>

              <div className="info-section">
                <div><strong>FIN:</strong> {userInfo?.person?.fin}</div>
                <div><strong>Rütbə:</strong> {userInfo?.person?.rank?.description}</div>
                <div><strong>Təşkilat:</strong> {userInfo?.person?.department?.tag}</div>
                <div><strong>Vəzifə:</strong> {userInfo?.person?.position}</div>
                <div><strong>Qoşulma tarixi:</strong> {new Date(userInfo?.createdAt).toLocaleDateString()}</div>
              </div>

              {userInfo?.admin && <div className="admin-badge"><MdAdminPanelSettings /> Admin</div>}
            </div>
          )
        }

        <form className="password-section-card" onSubmit={handlePasswordSubmit}>
          <h3>Parolu yenilə</h3>

          {["oldPass", "newPass", "confirmPass"].map((field, idx) => (
            <div className="password-input-wrapper" key={field}>
              <input
                type={showPassword[field] ? "text" : "password"}
                name={field}
                placeholder={
                  field === "oldPass" ? "Köhnə parol" :
                    field === "newPass" ? "Yeni parol" :
                      "Yeni parol təkrar"
                }
                value={passwordData[field]}
                onChange={handlePasswordChange}
              />
              <span className="password-toggle-icon" onClick={() => toggleShowPassword(field)}>
                {showPassword[field] ? <FaEye /> : <FaEyeSlash />}
              </span>
            </div>
          ))}

          <button type="submit" className="update-btn">Yenilə</button>
        </form>
      </div>
    </div>
  )
}

export default Profile
