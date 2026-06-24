import { useState, useEffect } from 'react';
import { userApi } from '../services/api';
import { User } from '../types';
import { useApp } from '../context/AppContext';

export const useAuth = () => {
  const { setUser } = useApp();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await userApi.getCurrentUser();
        if (response.success) {
          setUser(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [setUser]);

  return { loading };
};