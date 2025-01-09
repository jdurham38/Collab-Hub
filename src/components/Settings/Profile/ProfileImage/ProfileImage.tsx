"use client";
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSupabaseClient } from '@/lib/supabaseClient/supabase';
import styles from './ProfileImage.module.css';
import Image from 'next/image';

interface ProfileSelectorProps {
    profileUrl: string;
    setProfileUrl: (url: string) => void;
    setProfileFile: (file: File | null) => void;
}

const fetchPresetProfiles = async () => {
    const supabase = getSupabaseClient();
    const { data: files, error } = await supabase.storage
        .from('profile-images')
        .list('preset-images');

    if (error) {
        throw new Error(error.message);
    }
    if (!files) {
        return [];
    }

    const urls = await Promise.all(
        files.map(async (file) => {
            const { data } = await supabase.storage
                .from('profile-images')
                .getPublicUrl(`preset-images/${file.name}`);
            return data?.publicUrl || '';
        })
    );

    return urls;
};

const ProfileImage: React.FC<ProfileSelectorProps> = ({
    profileUrl,
    setProfileFile,
    setProfileUrl,
}) => {
    const { data: presetProfiles = [], isLoading, isError } = useQuery({
        queryKey: ['presetProfileImages'],
        queryFn: fetchPresetProfiles,
    });

    const [loaded, setLoaded] = useState<string[]>([]);
    const [overlayOpen, setOverlayOpen] = useState(false);
    const observer = useRef<IntersectionObserver | null>(null);
    const imageRefs = useRef<Record<string, HTMLDivElement | null>>({});


    const handlePresetSelect = (url: string) => {
        setProfileUrl(url);
        setProfileFile(null);
    };

    const loadImage = useCallback((url: string) => {
        if (loaded.includes(url) || !imageRefs.current[url]) return;
        setLoaded(prevLoaded => [...prevLoaded, url]);
    }, [loaded]);

    //Lazy load with intersection observer
    const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const url = entry.target.getAttribute('data-url') || "";
                loadImage(url);
            }
        });
    }, [loadImage]);
    const disconnectObserver = () => {
         if (observer.current) {
           observer.current.disconnect();
         }
      };

    useEffect(() => {
        disconnectObserver();
        observer.current = new IntersectionObserver(handleObserver, {
            root: null,
            rootMargin: '0px',
            threshold: 0.1,
        });
        if (presetProfiles) {
            presetProfiles.forEach(url => {
                 if (imageRefs.current[url]){
                      observer.current?.observe(imageRefs.current[url]);
                 }

            });
        }

        return () => {
            disconnectObserver()
        };

    }, [presetProfiles, handleObserver]);

     useEffect(()=>{
       if(overlayOpen && presetProfiles){
         disconnectObserver();
            observer.current = new IntersectionObserver(handleObserver, {
                 root: null,
                 rootMargin: '0px',
                 threshold: 0.1,
             });
          presetProfiles.forEach(url => {
                   if (imageRefs.current[url]){
                        observer.current?.observe(imageRefs.current[url]);
                   }

               });
           } else{
            disconnectObserver();
        }
           return() => {
            disconnectObserver()
           }
     }, [overlayOpen, presetProfiles, handleObserver])
     const toggleOverlay = () => {
        setOverlayOpen(!overlayOpen);
    };

    return (
        <div className={styles.profileSelector}>
              <div className={styles.profileImageContainer}>
              {profileUrl && (
                    <div className={styles.selectedProfileImage}>
                    <Image src={profileUrl} alt="Selected Profile" width={150} height={150} objectFit='cover'  className={styles.circularImage} />
                     </div>
                )}
                  <button type="button" onClick={toggleOverlay} className={styles.selectButton}>
                    Select Profile Image
                 </button>
            </div>


             {overlayOpen && (
                    <div className={styles.overlay}>
                        <div className={styles.overlayContent}>
                             <h3 className={styles.title}>Select a Profile Picture</h3>
                            {isLoading && <p>Loading profile pictures...</p>}
                            {isError && <p>Failed to load profile images.</p>}
                            <div className={styles.presetProfile}>
                                {presetProfiles.map((url) => (
                                    <div
                                        key={url}
                                        ref={el => {
                                             imageRefs.current[url] = el;
                                         }}
                                        data-url={url}
                                        className={`${styles.profileOption} ${profileUrl === url ? styles.selected : ''
                                            }`}
                                        onClick={() => handlePresetSelect(url)}
                                    >
                                        {loaded.includes(url) ? <Image src={url} alt="Preset Profile Image" width={100} height={100} objectFit='cover' /> :
                                            <div className={styles.spinner}></div>}

                                    </div>
                                ))}
                            </div>
                           <button onClick={() => setOverlayOpen(false)} className={styles.closeButton}>
                                  Close
                           </button>
                        </div>
                    </div>
                )}
        </div>
    );
};

export default ProfileImage;