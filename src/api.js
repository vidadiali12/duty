import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://localhost:9097',
  withCredentials: true,
});

const rawApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://localhost:9097',
  withCredentials: true,
});

let isRefreshing = false;
let refreshPromise = null;

api.interceptors.request.use(async (config) => {
  let token = localStorage.getItem("myUserDutyToken");
  let expiration = localStorage.getItem("tokenExpiration");
  const firstLogin = localStorage.getItem("firstLogin");

  if (token && expiration) {
    const now = new Date();

    const [datePart, timePart] = expiration.split(" ");
    const [day, month, year] = datePart.split("-").map(Number);
    const [eh, emin, second] = timePart.split(":").map(Number);

    const expDate = new Date(year, month - 1, day, eh, emin, second);

    let diffMinutes = (expDate - now) / 1000 / 60;

    // if (firstLogin) {
    //   if (emin <= now.getMinutes() && eh === now.getHours()) {
    //     diffMinutes = emin - now.getMinutes() + 15;
    //   } else if (eh !== now.getHours()) {
    //     diffMinutes = 15 - (60 - emin + now.getMinutes());
    //   }
    //   diffMinutes = Math.max(0, diffMinutes);
    // }
    
    // console.log(expDate, now)
    // console.log(diffMinutes)
    if (diffMinutes <= 1) {
      if (!isRefreshing) {
        localStorage.removeItem("firstLogin");
        isRefreshing = true;

        refreshPromise = (async () => {
          try {

            const requestDataJson = { accessToken: token };

            const response = await rawApi.put("/auth/renewToken", requestDataJson, {
              headers: { 'Content-Type': 'application/json' }
            });

            localStorage.setItem("myUserDutyToken", response?.data?.data?.accessToken);
            localStorage.setItem("tokenExpiration", response?.data?.data?.tokenExpDate);

          } catch (err) {
            console.log("❌ Token yenilənmədi:", err);
            localStorage.clear()
          } finally {
            isRefreshing = false;
            refreshPromise = null;
          }
        })();
      }

      await refreshPromise;
    }

    config.headers.Authorization = `Bearer ${localStorage.getItem("myUserDutyToken")}`;
  }

  return config;
}, (error) => Promise.reject(error));

export { refreshPromise };
export default api;
