import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { useTheme } from '../ThemeContext';

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 10px;
  padding: 10px;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: ${props => props.theme.surface}CC;
    padding: 20px;
    backdrop-filter: blur(10px);
  }
`;

const Button = styled.button`
  padding: 10px 20px;
  margin: 10px;
  font-size: 16px;
  cursor: pointer;
  border: none;
  background-color: ${props => props.theme.primary};
  color: ${props => props.theme.buttonText};
  border-radius: 5px;
  transition: all 0.3s ease;

  &:hover {
    opacity: 0.9;
  }
  
  &:disabled {
    background-color: ${props => props.theme.secondary};
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme.error};
  margin: 10px 0;
  padding: 10px;
  background-color: ${props => `${props.theme.error}15`};
  border-radius: 5px;
`;

const PhotoPreviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 10px;
  margin: 10px 0;
  padding: 10px;
  background: ${props => props.theme.surface};
  border-radius: 5px;
`;

const PreviewImage = styled.div`
  position: relative;
  width: 100%;
  padding-bottom: 100%;
  border-radius: 5px;
  overflow: hidden;
  box-shadow: 0 2px 4px ${props => `${props.theme.text}15`};
  
  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const DeleteButton = styled.button`
  position: absolute;
  top: 5px;
  right: 5px;
  background: ${props => `${props.theme.error}CC`};
  color: ${props => props.theme.buttonText};
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  z-index: 1;
  
  &:hover {
    background: ${props => props.theme.error};
  }
`;

const FileInput = styled.input`
  display: none;
`;

const FileInputLabel = styled.label`
  padding: 10px 20px;
  margin: 10px;
  font-size: 16px;
  cursor: pointer;
  border: none;
  background-color: ${props => props.theme.secondary};
  color: ${props => props.theme.buttonText};
  border-radius: 5px;
  transition: all 0.3s ease;
  
  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const CategoryIndicator = styled.div`
  margin: 10px 0;
  padding: 8px;
  background-color: ${props => props.theme.surface};
  border-radius: 4px;
  font-weight: bold;
  color: ${props => props.theme.text};
  transition: all 0.3s ease;
`;

const CameraControls = ({ onCapture, category, selectedDate }) => {
  const { theme } = useTheme();
  const fileInputRef = useRef(null);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState([]);

  const SERVER_URL = 'http://192.168.50.212:5000';

  const handleFileSelect = async (event) => {
    if (!category) {
      setError('Please select a category (Inventory or Shipments) before choosing photos');
      return;
    }

    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setError(null);
    for (const file of files) {
      try {
        const photoData = await readFileAsDataURL(file);
        setCapturedPhotos(prev => [...prev, { 
          data: photoData, 
          file: file 
        }]);
      } catch (error) {
        console.error('Error reading file:', error);
        setError('Error processing photo. Please try again.');
      }
    }
  };

  const readFileAsDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const uploadAllPhotos = async () => {
    if (!category) {
      setError('Please select a category before uploading');
      return;
    }

    if (capturedPhotos.length === 0) {
      setError('Please select photos first');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      const uploadResults = [];

      for (const photo of capturedPhotos) {
        const formData = new FormData();
        formData.append('category', category);
        formData.append('date', selectedDate.toISOString().split('T')[0]);
        formData.append('photo', photo.file);

        const response = await fetch(`${SERVER_URL}/api/upload`, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Upload failed');
        }

        const result = await response.json();
        uploadResults.push(result);
      }

      onCapture(uploadResults.map(result => result.filepath));
      setCapturedPhotos([]);
    } catch (error) {
      console.error('Upload error:', error);
      setError(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const removePhoto = (index) => {
    setCapturedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div>
      {category && (
        <CategoryIndicator theme={theme}>
          Selected Category: {category}
        </CategoryIndicator>
      )}
      
      {error && <ErrorMessage theme={theme}>{error}</ErrorMessage>}

      {capturedPhotos.length > 0 && (
        <>
          <PhotoPreviewGrid theme={theme}>
            {capturedPhotos.map((photo, index) => (
              <PreviewImage key={index} theme={theme}>
                <img 
                  src={photo.data} 
                  alt={`Photo ${index + 1}`} 
                />
                <DeleteButton onClick={() => removePhoto(index)} theme={theme}>×</DeleteButton>
              </PreviewImage>
            ))}
          </PhotoPreviewGrid>
          
          <Button
            onClick={uploadAllPhotos}
            disabled={isUploading || !category}
            theme={theme}
          >
            {isUploading 
              ? 'Uploading...' 
              : `Upload ${capturedPhotos.length} Photo${capturedPhotos.length > 1 ? 's' : ''}`}
          </Button>
        </>
      )}

      <ButtonContainer theme={theme}>
        <FileInput
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileSelect}
          id="file-input"
          multiple
          disabled={isUploading}
        />
        <FileInputLabel 
          htmlFor="file-input"
          theme={theme}
          style={{ opacity: isUploading ? 0.6 : 1 }}
        >
          Choose Photos
        </FileInputLabel>
      </ButtonContainer>
    </div>
  );
};

export default CameraControls;