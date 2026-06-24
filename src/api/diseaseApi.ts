import axiosInstance from './axiosInstance';

export const predictDiseaseApi = async (image: File) => {
  const formData = new FormData();
  formData.append('image', image);
  const response = await axiosInstance.post('/disease/predict', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};