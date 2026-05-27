import { useState, useEffect } from 'react';

export const useRegions = () => {
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'https://city-guard-backend.onrender.com';
        const response = await fetch(`${API_URL}/api/regions`);
        if (!response.ok) {
          throw new Error('Failed to fetch regions');
        }
        const data = await response.json();
        setRegions(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
        // Fallback default regions if API fails
        setRegions([
          { _id: 'fallback-1', name: 'Downtown' },
          { _id: 'fallback-2', name: 'Brooklyn' },
          { _id: 'fallback-3', name: 'Greenwood Society' },
          { _id: 'fallback-4', name: 'Sunrise Apartments' }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchRegions();
  }, []);

  return { regions, loading, error };
};
