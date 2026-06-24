import axiosInstance from './axiosInstance';

export const predictIotApi = async (data: {
  temperature: number;
  humidity: number;
  soil_moisture: number;
}) => {
  const response = await axiosInstance.post('/iot/predict', data);
  return response.data;
}; 