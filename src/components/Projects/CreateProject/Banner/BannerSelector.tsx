import React, { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabaseClient/supabase';
import styles from './BannerSelector.module.css';
import Image from 'next/image';

interface BannerSelectorProps {
  bannerUrl: string;
  setBannerUrl: (url: string) => void;
  setBannerFile: (file: File | null) => void;
}

const BannerSelector: React.FC<BannerSelectorProps> = ({ bannerUrl, setBannerUrl, setBannerFile }) => {
  const supabase = getSupabaseClient();

  const [errorMessage, setErrorMessage] = useState('');
  const [presetBanners, setPresetBanners] = useState<string[]>([]);
  const [loadingBanners, setLoadingBanners] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchPresetBanners = async () => {
      const { data: files, error } = await supabase.storage
        .from('project-banners')
        .list('preset-banners');

      if (error) {
        console.error('Error fetching preset banners:', error.message);
        setErrorMessage('Failed to load preset banners.');
        return;
      }

      const urls = files?.map((file) => {
        const { data } = supabase.storage
          .from('project-banners')
          .getPublicUrl(`preset-banners/${file.name}`);
        return data?.publicUrl || '';
      }) || [];

      setPresetBanners(urls);
    };

    fetchPresetBanners();
  }, [supabase]);

  const handlePresetSelect = (url: string) => {
    setBannerUrl(url);
    setBannerFile(null); // Clear any uploaded file
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

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setErrorMessage('File size exceeds the maximum limit of 5MB.');
      return;
    }

    setBannerUrl(URL.createObjectURL(file)); // Show a preview
    setBannerFile(file); // Set the file for later upload
    setErrorMessage('');
  };

  const handleRemoveBanner = () => {
    setBannerUrl('');
    setBannerFile(null);
  };

  return (
    <div className={styles.bannerSelector}>
      <h3 className={styles.title}>Select a Banner</h3>
      <div className={styles.presetBanners}>
        {presetBanners.map((url) => (
          <div
            key={url}
            className={`${styles.bannerOption} ${bannerUrl === url ? styles.selected : ''}`}
            onClick={() => handlePresetSelect(url)}
          >
            {loadingBanners[url] && <div className={styles.spinner}></div>}
            <Image
              src={url}
              alt="Preset Banner"
              width={200}
              height={100}

              onLoad={() => setLoadingBanners((prev) => ({ ...prev, [url]: false }))}
              className={loadingBanners[url] ? styles.hiddenImage : ''}
            />
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
          disabled={bannerUrl.startsWith('http')}
          className={styles.uploadInput}
        />
        {errorMessage && <p className={styles.error}>{errorMessage}</p>}
      </div>
      {bannerUrl && (
        <div className={styles.preview}>
          <Image src={bannerUrl} alt="Selected Banner" width={900} height={250} className={styles.previewImage} />
          <button onClick={handleRemoveBanner} className={styles.removeBannerButton}>
            Remove Banner
          </button>
        </div>
      )}
    </div>
  );
};

export default BannerSelector;
