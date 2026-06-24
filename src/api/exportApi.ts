import axiosInstance from './axiosInstance';

export const predictExportApi = async (data: {
  crop_type: string;
  quality_grade: string;
  weight: number;
  region: string;
}) => {
  const response = await axiosInstance.post('/export/predict', data);
  return response.data;
};