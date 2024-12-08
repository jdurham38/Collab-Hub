"use client";

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSupabaseClient } from '@/lib/supabaseClient/supabase';
import styles from './index.module.css'; // Changed CSS file name
import Image from 'next/image';

interface EditBannerProps {
  bannerUrl: string;
  setBannerUrl: (url: string) => void;
  setBannerFile: (file: File | null) => void;
}

const fetchPresetBanners = async () => {
  const supabase = getSupabaseClient();
  const { data: files, error } = await supabase.storage
    .from('project-banners')
    .list('preset-banners');

  if (error) {
    throw new Error(error.message);
  }

  const urls =
    files?.map((file) => {
      const { data } = supabase.storage
        .from('project-banners')
        .getPublicUrl(`preset-banners/${file.name}`);
      return data?.publicUrl || '';
    }) || [];

  return urls;
};

const EditBanner: React.FC<EditBannerProps> = ({
  bannerUrl,
  setBannerUrl,
  setBannerFile,
}) => {
  const [errorMessage, setErrorMessage] = useState('');
  const [currentBannerUrl, setCurrentBannerUrl] = useState(bannerUrl); // Local state for preview

  const {
    data: presetBanners = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['presetBanners'],
    queryFn: fetchPresetBanners,
  });

  // Update local banner URL when the prop changes
  useEffect(() => {
    setCurrentBannerUrl(bannerUrl);
  }, [bannerUrl]);

  const handlePresetSelect = (url: string) => {
    setCurrentBannerUrl(url); // Update local state for preview
    setBannerUrl(url);
    setBannerFile(null);
  };

  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      setErrorMessage('You must select an image to upload.');
      return;
    }

    const file = event.target.files[0];
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Only image files are allowed.');
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrorMessage('File size exceeds the maximum limit of 5MB.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setCurrentBannerUrl(previewUrl); // Update local state for preview
    setBannerUrl(previewUrl);
    setBannerFile(file);
    setErrorMessage('');
  };

  const handleRemoveBanner = () => {
    setCurrentBannerUrl(''); // Update local state for preview
    setBannerUrl('');
    setBannerFile(null);
  };

  return (
    <div className={styles.editBanner}>
      <h3 className={styles.title}>Select a Banner</h3>
      {isLoading && <p>Loading banners...</p>}
      {isError && <p className={styles.error}>Failed to load banners.</p>}
      <div className={styles.presetBanners}>
        {presetBanners.map((url) => (
          <div
            key={url}
            className={`${styles.bannerOption} ${
              currentBannerUrl === url ? styles.selected : ''
            }`}
            onClick={() => handlePresetSelect(url)}
          >
            <Image src={url} alt="Preset Banner" width={200} height={100} />
          </div>
        ))}
      </div>
      <div className={styles.uploadSection}>
        <label htmlFor="banner-upload" className={styles.uploadLabel}>
          Upload Your Own Banner
        </label>
        <input
          type="file"
          id="banner-upload"
          accept="image/*"
          onChange={handleFileSelection}
          className={styles.uploadInput}
        />
        {errorMessage && <p className={styles.error}>{errorMessage}</p>}
      </div>
      {currentBannerUrl && (
        <div className={styles.preview}>
          <Image
            src={currentBannerUrl}
            alt="Selected Banner"
            width={900}
            height={250}
            className={styles.previewImage}
          />
          <button
            onClick={handleRemoveBanner}
            className={styles.removeBannerButton}
          >
            Remove Banner
          </button>
        </div>
      )}
    </div>
  );
};

export default EditBanner;