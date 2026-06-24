import axiosInstance from './axiosInstance';

export const predictQualityApi = async (image: File) => {
  const formData = new FormData();
  formData.append('image', image);
  const response = await axiosInstance.post('/quality/predict', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};