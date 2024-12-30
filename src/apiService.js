import axios from "axios";

const BASE_URL = "https://workwise-backend-m1ib.onrender.com";

export const fetchSeats = async () => {
  const res = await axios.get(`${BASE_URL}/seats`);
  return res.data;
};

// Book seats

export const bookSeats = async (seatNumbers) => {
  const res = await axios.post(`${BASE_URL}/book`, { seatNumbers });
  return res.data;
};

// Reset seats
export const resetSeats = async () => {
  const res = await axios.post(`${BASE_URL}/reset`);
  return res.data;
};
