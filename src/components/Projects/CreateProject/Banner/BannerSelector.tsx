import React, { useState } from 'react';
import { getSupabaseClient } from '@/lib/supabaseClient/supabase';
import { useAuthStore } from '@/lib/useAuthStore';
import styles from './BannerSelector.module.css';
import Image from 'next/image';

interface BannerSelectorProps {
  bannerUrl: string;
  setBannerUrl: (url: string) => void;
}

const presetBanners = [
  'img1.jpg',
];

const BannerSelector: React.FC<BannerSelectorProps> = ({ bannerUrl, setBannerUrl }) => {
  const supabase = getSupabaseClient();
  const { session } = useAuthStore();

  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handlePresetSelect = (bannerName: string) => {
    const url = `/images/preset-banners/${bannerName}`;
    setBannerUrl(url);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!session) {
        throw new Error('You must be logged in to upload a banner.');
      }

      setUploading(true);
      setErrorMessage('');

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];

      if (!file.type.startsWith('image/')) {
        throw new Error('Only image files are allowed.');
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('File size exceeds the maximum limit of 5MB.');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `custom-banners/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('project-banners')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('project-banners')
        .getPublicUrl(filePath);

      if (!data || !data.publicUrl) {
        throw new Error('Failed to get public URL of the uploaded image.');
      }

      setBannerUrl(data.publicUrl);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error uploading banner image:', error.message);
        setErrorMessage(error.message || 'Error uploading image.');
      } else {
        console.error('Unknown error:', error);
        setErrorMessage('An unknown error occurred.');
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={styles.bannerSelector}>
      <h3>Select a Banner</h3>
      <div className={styles.presetBanners}>
        {presetBanners.map((banner) => (
          <div
            key={banner}
            className={`${styles.bannerOption} ${bannerUrl === banner ? styles.selected : ''}`}
            onClick={() => handlePresetSelect(banner)}
          >
            <Image
              src={`/images/preset-banners/${banner}`}
              alt={`Banner ${banner}`}
              width={200} // Set desired width here
              height={100} // Set desired height here
            />
          </div>
        ))}
      </div>
      <div className={styles.uploadSection}>
        <label htmlFor="banner-upload" className={styles.uploadLabel}>
          {uploading ? 'Uploading...' : 'Upload Your Own Banner'}
        </label>
        <input
          type="file"
          id="banner-upload"
          accept="image/*"
          onChange={handleFileUpload}
          disabled={uploading}
          className={styles.uploadInput}
        />
        {errorMessage && <p className={styles.error}>{errorMessage}</p>}
      </div>
      {bannerUrl && (
        <div className={styles.preview}>
          <h4>Selected Banner:</h4>
          <Image
            src={bannerUrl}
            alt="Selected Banner"
            width={500} // Set desired width for preview here
            height={250} // Set desired height for preview here
            className={styles.previewImage}
          />
        </div>
      )}
    </div>
  );
};

export default BannerSelector;
