// src/utils/api.js
const SERVER_URL = process.env.REACT_APP_SERVER_URL;

export const apiFetch = async (endpoint, options = {}) => {
  const response = await fetch(`${SERVER_URL}${endpoint}`, options);
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'API request failed');
  }
  return response.json();
};

export const uploadPhoto = async (file, category, date) => {
  const formData = new FormData();
  formData.append('category', category);
  formData.append('date', date);
  formData.append('photo', file);

  return apiFetch('/api/upload', {
    method: 'POST',
    body: formData,
  });
};
