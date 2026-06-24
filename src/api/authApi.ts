import axiosInstance from './axiosInstance';

export const loginApi = async (email: string, password: string) => {
  const response = await axiosInstance.post('/auth/login', { email, password });
  return response.data;
};

export const registerApi = async (data: {
  name: string;
  email: string;
  password: string;
  role: string;
}) => {
  const response = await axiosInstance.post('/auth/register', data);
  return response.data;
};

export const forgotPasswordApi = async (email: string) => {
  const response = await axiosInstance.post('/auth/forgot-password', { email });
  return response.data;
};