const token = localStorage.getItem("token"); // Or however you store it
const Config = {
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
};
export default Config;