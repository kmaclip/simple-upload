import React, { useState } from 'react';
import styled from 'styled-components';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  cursor: pointer;
`;

const StyledLazyImage = styled(LazyLoadImage)`
  width: 100%;
  max-width: 400px;
  border-radius: 10px;
  margin-top: 20px;
  transition: opacity 0.3s;
`;

const ButtonContainer = styled.div`
  position: absolute;
  bottom: 10px;
  right: 10px;
  display: flex;
  gap: 10px;
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  background-color: ${props => (props.$delete ? '#dc3545' : '#007bff')};
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  opacity: 0.9;
  
  &:hover {
    opacity: 1;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ConfirmationModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  max-width: 300px;
  text-align: center;
`;

const ModalButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
`;

const ModalButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  background-color: ${props => (props.confirm ? '#dc3545' : '#6c757d')};
  color: white;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PhotoPreview = ({ photo, photoId, category, date, onDelete }) => {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const SERVER_URL = process.env.REACT_APP_SERVER_URL;
  const thumbnailUrl = `${SERVER_URL}/${photo.thumbnail_path}`;
  const fullImageUrl = `${SERVER_URL}/${photo.filepath}`;

  const handleDownload = async () => {
    try {
      const response = await fetch(fullImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${category}-${date}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirmation(true);
  };

  const confirmDelete = async () => {
    if (!photoId) {
      console.error('No photo ID provided for deletion');
      return;
    }
    setIsDeleting(true);
    try {
      await onDelete();
      setShowDeleteConfirmation(false);
    } catch (err) {
      console.error('Error deleting photo:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ImageContainer>
      <StyledLazyImage
        src={thumbnailUrl}
        threshold={100}
        effect="blur"
        beforeLoad={() => setImageLoaded(false)}
        afterLoad={() => setImageLoaded(true)}
        style={{ opacity: imageLoaded ? 1 : 0.5 }}
        onClick={() => window.open(fullImageUrl, '_blank')}
        alt={`${category} photo from ${date}`}
      />
      <ButtonContainer>
        <ActionButton onClick={handleDownload}>
          Download
        </ActionButton>
        <ActionButton $delete onClick={handleDelete} disabled={isDeleting}>
          {isDeleting ? 'Deleting...' : 'Delete'}
        </ActionButton>
      </ButtonContainer>

      {showDeleteConfirmation && (
        <ConfirmationModal onClick={() => setShowDeleteConfirmation(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <h3>Delete Photo?</h3>
            <p>Are you sure you want to delete this photo? This action cannot be undone.</p>
            <ModalButtons>
              <ModalButton onClick={() => setShowDeleteConfirmation(false)} disabled={isDeleting}>
                Cancel
              </ModalButton>
              <ModalButton confirm onClick={confirmDelete} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Delete'}
              </ModalButton>
            </ModalButtons>
          </ModalContent>
        </ConfirmationModal>
      )}
    </ImageContainer>
  );
};

export default PhotoPreview;
