// src/App.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import CategoryButtons from './components/CategoryButtons';
import DatePickerComponent from './components/DatePicker';
import CameraControls from './components/CameraControls';
import PhotoPreview from './components/PhotoPreview';
import { useTheme } from './contexts/ThemeContext';
import { apiFetch } from './utils/api';

const Container = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
  background-color: ${props => props.theme.background};
  color: ${props => props.theme.text};
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    padding: 10px;
    padding-bottom: 80px;
  }
`;

const StatusMessage = styled.div`
  margin: 10px 0;
  padding: 10px;
  border-radius: 5px;
  color: ${props => (props.error ? props.theme.error : props.theme.success)};
  background-color: ${props =>
    props.error ? 'rgba(220, 53, 69, 0.1)' : 'rgba(40, 167, 69, 0.1)'};
  border: 1px solid ${props => (props.error ? props.theme.error : props.theme.success)};
  display: ${props => (props.message ? 'block' : 'none')};
`;

const PhotoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 10px;
  }
`;

const Title = styled.h1`
  color: ${props => props.theme.text};
  margin-bottom: 20px;

  @media (max-width: 768px) {
    font-size: 24px;
    margin-bottom: 15px;
  }
`;

const LoadingSpinner = styled.div`
  margin: 20px 0;
  color: ${props => props.theme.primary};
  font-weight: bold;
`;

const PhotoCount = styled.div`
  margin: 10px 0;
  color: ${props => props.theme.textSecondary};
  font-size: 14px;
`;

const ViewButton = styled.button`
  padding: 10px 20px;
  margin: 10px;
  background-color: ${props => props.theme.primary};
  color: ${props => props.theme.buttonText};
  border: none;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    opacity: 0.9;
  }
`;

const ThemeToggle = styled.button`
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 10px;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  border: none;
  background-color: ${props => props.theme.primary};
  color: ${props => props.theme.buttonText};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;

  &:hover {
    opacity: 0.9;
  }

  @media (max-width: 768px) {
    top: 10px;
    right: 10px;
  }
`;

const App = () => {
  const { theme, toggleTheme, isDarkMode } = useTheme();
  const [category, setCategory] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showPhotos, setShowPhotos] = useState(false);

  useEffect(() => {
    if (category && selectedDate) {
      fetchPhotos();
    }
  }, [category, selectedDate]);

  useEffect(() => {
    let timeoutId;
    if (success) {
      timeoutId = setTimeout(() => {
        setSuccess(null);
      }, 3000);
    }
    return () => clearTimeout(timeoutId);
  }, [success]);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      setError(null);
      const formattedDate = selectedDate.toISOString().split('T')[0];
      const data = await apiFetch(`/api/photos?category=${category}&date=${formattedDate}`);
      setPhotos(data.photos || []);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Error loading photos. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCategory = (selectedCategory) => {
    setCategory(selectedCategory);
    setError(null);
    setSuccess(null);
    setShowPhotos(false);
  };

  const handleCapturePhoto = async (filepaths) => {
    try {
      setIsUploading(true);
      setError(null);
      setSuccess(null);
      setSuccess(`Successfully uploaded ${filepaths.length} photo${filepaths.length > 1 ? 's' : ''}!`);
      await fetchPhotos();
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload photos. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setError(null);
    setSuccess(null);
    setShowPhotos(false);
  };

  const handleDeletePhoto = async (photoId) => {
    try {
      await apiFetch(`/api/photos/${photoId}`, { method: 'DELETE' });
      setSuccess('Photo deleted successfully');
      await fetchPhotos();
    } catch (err) {
      setError('Error deleting photo: ' + err.message);
    }
  };

  return (
    <Container theme={theme}>
      <ThemeToggle onClick={toggleTheme} theme={theme}>
        {isDarkMode ? '☀️' : '🌙'}
      </ThemeToggle>

      <Title theme={theme}>CopyManifests</Title>

      <CategoryButtons onSelectCategory={handleSelectCategory} selectedCategory={category} />

      <DatePickerComponent selectedDate={selectedDate} onChange={handleDateChange} />

      {category ? (
        <>
          <CameraControls
            onCapture={handleCapturePhoto}
            disabled={loading || !category || isUploading}
            category={category}
            selectedDate={selectedDate}
            isUploading={isUploading}
          />
          {photos.length > 0 && (
            <div>
              <PhotoCount theme={theme}>
                {photos.length} photo{photos.length !== 1 ? 's' : ''} for {category} on {selectedDate.toLocaleDateString()}
              </PhotoCount>
              <ViewButton onClick={() => setShowPhotos(!showPhotos)} theme={theme}>
                {showPhotos ? 'Hide Photos' : 'View Photos'}
              </ViewButton>
            </div>
          )}
        </>
      ) : (
        <p>Please select a category first</p>
      )}

      {(error || success) && (
        <StatusMessage error={!!error} message={error || success} theme={theme}>
          {error || success}
        </StatusMessage>
      )}

      {loading && <LoadingSpinner theme={theme}>Loading photos...</LoadingSpinner>}

      {showPhotos && (
        <PhotoGrid>
          {photos.map((photo, index) => (
            <PhotoPreview
              key={photo.id || index}
              photo={photo}
              photoId={photo.id}
              category={category || ''}
              date={selectedDate.toISOString().split('T')[0]}
              onDelete={() => handleDeletePhoto(photo.id)}
            />
          ))}
        </PhotoGrid>
      )}
    </Container>
  );
};

export default App;
