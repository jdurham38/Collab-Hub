"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import useAuthRedirect from '@/hooks/dashboard/useAuthRedirect';
import editProfileService, {
    ProfileUpdateData,
    ProfileUpdateResponse,
    ProfileUpdateErrorResponse,
} from '@/services/UserSettings/editProfileService';
import ProjectRolesDropdown from '@/utils/ProjectRolesDropdown/ProjectRolesDropdown';
import { normalizeUrl } from '@/utils/linkChecker';
import styles from './Profile.module.css';
import ProfileImage from './ProfileImage/ProfileImage';
import ShortBioInput from './ShortBioInput/ShortBioInput';
import BioInput from './BioInput/BioInput';
import UrlInput from './UrlInput/UrlInput';
import { FaInstagram } from "react-icons/fa";
import { TbWorldWww } from "react-icons/tb";
import { FaLinkedin } from "react-icons/fa";
import { FaBehanceSquare } from "react-icons/fa";
import { FaSquareXTwitter } from "react-icons/fa6";
import { AiFillTikTok } from "react-icons/ai";
const EditProfile: React.FC = () => {
    const [formData, setFormData] = useState<ProfileUpdateData>({
        shortBio: null,
        bio: null,
        personalWebsite: null,
        instagramLink: null,
        linkedinLink: null,
        behanceLink: null,
        twitterLink: null,
        tiktokLink: null,
        role: '',
        profileImageUrl: '', // Added profileImageUrl
    });

    const [initialFormData, setInitialFormData] = useState<ProfileUpdateData>(
        {} as ProfileUpdateData
      );

    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const user = useAuthRedirect();
    const userId = user?.id || '';

    const [profileUrl, setProfileUrl] = useState<string>(''); // State for profile URL
    const [initialProfileUrl, setInitialProfileUrl] = useState('');
    const [, setProfileFile] = useState<File | null>(null); // State for profile file

    const [urlErrors, setUrlErrors] = useState({
        personalWebsite: null,
        instagramLink: null,
        linkedinLink: null,
        behanceLink: null,
        twitterLink: null,
        tiktokLink: null,
    });

    const hasErrors = !!Object.values(urlErrors).some(error => error !== null);
    const formRef = useRef<HTMLFormElement | null>(null)

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            setErrorMessage(null);
            try {
                const result:
                    | ProfileUpdateResponse
                    | ProfileUpdateErrorResponse = await editProfileService.getProfile(
                    userId
                );
                setLoading(false);

                if ('user' in result) {
                     setInitialFormData(result.user);
                    setFormData(result.user);
                    setInitialProfileUrl(result.user.profileImageUrl || "");
                    setProfileUrl(result.user.profileImageUrl || ""); //set profile url on load

                } else {
                    setErrorMessage(result.error);
                }
            } catch (error) {
                console.error('Error fetching user profile: ', error);
                setLoading(false);
                setErrorMessage('Failed to fetch user profile.');
            }
        };

        fetchProfile();
    }, [userId]);

    const handleUrlChange = (name: string, value: string) => {
        setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
        setUrlErrors((prevErrors) => ({ ...prevErrors, [name]: null }));
    };

    const handleShortBioChange = (value: string) => {
        setFormData((prevFormData) => ({ ...prevFormData, shortBio: value }));
    };

    const handleBioChange = (value: string) => {
        setFormData((prevFormData) => ({ ...prevFormData, bio: value }));
    };

    const handleRoleChange = (newRole: string) => {
        setFormData((prevFormData) => ({ ...prevFormData, role: newRole }));
    };

    //callback for handling profile image url
    const handleProfileUrlChange = (url: string) => {
         setProfileUrl(url);
        setFormData((prevFormData) => ({
            ...prevFormData,
            profileImageUrl: url, //updates the profileImageUrl when the profile url is set
        }));
    };


    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            if (hasErrors) {
                setErrorMessage('Please fix all errors before submitting');
                return;
            }
            setLoading(true);
            setSuccessMessage(null);
            setErrorMessage(null);

            const formattedFormData = {
                ...formData,
                personalWebsite: normalizeUrl(formData.personalWebsite),
                instagramLink: normalizeUrl(formData.instagramLink),
                linkedinLink: normalizeUrl(formData.linkedinLink),
                behanceLink: normalizeUrl(formData.behanceLink),
                twitterLink: normalizeUrl(formData.twitterLink),
                tiktokLink: normalizeUrl(formData.tiktokLink),
            };
            // Prepare data for the profile update API call
            const profileUpdateData = {
                ...formattedFormData,
                profileUrl: formData.profileImageUrl || null,  //use profileImageUrl here
            };

            const result:
                | ProfileUpdateResponse
                | ProfileUpdateErrorResponse = await editProfileService.editProfile(
                userId,
                profileUpdateData
            );
            setLoading(false);

            if ('user' in result) {
                // Handle successful update
                setSuccessMessage('Profile updated successfully');
                setInitialFormData(result.user);
                console.log('Profile updated successfully', result.user);
            } else {
                // Handle error
                setErrorMessage(result.error);
                console.error('Profile update failed:', result.error);
            }
        },
        [formData, userId, hasErrors]
    );
     const handleCancelChanges = useCallback(() => {
           setFormData(initialFormData);
           setProfileUrl(initialProfileUrl);
            if(formRef.current) {
                 formRef.current.reset();
             }

      }, [initialFormData, initialProfileUrl, formRef]);

        const isChanged = () => {
              return JSON.stringify(formData) !== JSON.stringify(initialFormData) || profileUrl !== initialProfileUrl;
           }


    return (
         <div className={`${styles.container}`}>
           {loading ? (
                <div className={styles.loading}>Loading profile...</div>
            ) : errorMessage ? (
                <div className={styles.errorMessage}>{errorMessage}</div>
            ) : (
                 <div className={styles.card}>
                <h2 className="text-2xl font-bold mb-4">Edit Profile</h2>

                <form onSubmit={handleSubmit} className={`${styles.form}`} ref={formRef}>
                    <div className={styles.profileImageContainer}>
                         <ProfileImage
                            profileUrl={profileUrl}
                            setProfileUrl={handleProfileUrlChange}
                            setProfileFile={setProfileFile}
                        />
                    </div>
                   <div className={styles.inputContainer}>
                        <ProjectRolesDropdown value={formData.role} onChange={handleRoleChange} />
                    </div>
                    <ShortBioInput value={formData.shortBio || null} onChange={handleShortBioChange} />

                    <BioInput value={formData.bio || null} onChange={handleBioChange} />


                    <div className={styles.urlInputsGrid}>
                    
                         <UrlInput
                            name="personalWebsite"
                            value={formData.personalWebsite || null}
                            placeholder="https://your-personal-site.com"
                            onChange={(value) => handleUrlChange("personalWebsite",value)}
                            Icon={<TbWorldWww />}
                        />
                        
                         <UrlInput
                            name="instagramLink"
                            value={formData.instagramLink || null}
                            placeholder="https://instagram.com/your-profile"
                             onChange={(value) => handleUrlChange("instagramLink",value)}
                             Icon={<FaInstagram />}
                        />
                        
                       <UrlInput
                            name="linkedinLink"
                            value={formData.linkedinLink || null}
                            placeholder="https://linkedin.com/your-profile"
                            onChange={(value) => handleUrlChange("linkedinLink",value)}
                            Icon={<FaLinkedin />}
                        />
                        
                        <UrlInput
                            name="behanceLink"
                            value={formData.behanceLink || null}
                            placeholder="https://behance.com/your-profile"
                            onChange={(value) => handleUrlChange("behanceLink",value)}
                            Icon={<FaBehanceSquare />}
                        />
                         <UrlInput
                            name="twitterLink"
                            value={formData.twitterLink || null}
                            placeholder="https://twitter.com/your-profile"
                            onChange={(value) => handleUrlChange("twitterLink",value)}
                            Icon={<FaSquareXTwitter />
                            }
                        />
                        <UrlInput
                            name="tiktokLink"
                            value={formData.tiktokLink || null}
                            placeholder="https://tiktok.com/your-profile"
                            onChange={(value) => handleUrlChange("tiktokLink",value)}
                            Icon={<AiFillTikTok />
                            }
                        />
                   </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '1rem' }}>
                         <button
                             type="button"
                             disabled={loading || hasErrors || !isChanged()}
                             className={`${styles.cancelButton} `}
                              onClick={handleCancelChanges}
                             >
                               Cancel Changes
                            </button>
                        <button
                            type="submit"
                            disabled={loading || hasErrors || !isChanged()}
                            className={`${styles.submitButton} `}
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>

                    </div>


                    {successMessage && <p className={styles.success}>{successMessage}</p>}
                </form>
                 </div>
            )}
        </div>
    );
};

export default EditProfile;