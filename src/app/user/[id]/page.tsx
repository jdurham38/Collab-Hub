'use client';
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { User } from '@/utils/interfaces';
import Loader from '@/components/Loader/Loader';
import styles from './page.module.css';
import Image from 'next/image';
import { FaInstagram } from 'react-icons/fa';
import { TbWorldWww } from 'react-icons/tb';
import { FaLinkedin } from 'react-icons/fa';
import { FaBehanceSquare } from 'react-icons/fa';
import { FaSquareXTwitter } from 'react-icons/fa6';
import { AiFillTikTok } from 'react-icons/ai';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import ProjectInviteOverlay from './ProjectInviteOverlay/ProjectInviteOverlay';

const UserProfilePage: React.FC = () => {
    const params = useParams();
    const id = params?.id as string;
    const [userInfo, setUserInfo] = useState<User & { projectCount?: number, friendCount?: number} | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isOverlayOpen, setIsOverlayOpen] = useState(false); // State for the overlay


      // For Testimonials
    const [testimonialIndex, setTestimonialIndex] = useState(0);
    const testimonials = [
        'Great collaborator',
        'Amazing work!',
        'Very talented individual',
        'Highly recommend',
        'A pleasure to work with',
        'An asset to any team'
    ];

    const handlePrevTestimonial = () => {
        setTestimonialIndex((prevIndex) =>
          prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
        );
    };
    
    const handleNextTestimonial = () => {
        setTestimonialIndex((prevIndex) =>
          prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
        );
    };


    useEffect(() => {
        const fetchUserData = async () => {
            if (!id) {
                return;
            }
            setLoading(true);
            try {
                const response = await fetch(`/api/users-page/user-profile/${id}`);
                if (!response.ok) {
                     let errorMessage = `Failed to fetch user: ${response.statusText}`;
                     try {
                        const errorData = await response.json();
                        if (errorData && errorData.error) {
                            errorMessage = errorData.error;
                        }
                     } catch(parseError) {
                         console.log("error parsing error message", parseError)
                     }
                    throw new Error(errorMessage);
                }
                const { user, projectCount, friendCount } = await response.json();
                setUserInfo({ ...user, projectCount, friendCount });

            } catch (e) {
                let errorMessage = "An unexpected error occurred.";
                if (e instanceof Error) {
                    errorMessage = e.message || 'An error occurred while fetching user.';
                } else if (typeof e === 'string'){
                    errorMessage = e;
                }
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [id]);

    const openOverlay = () => {
         setIsOverlayOpen(true);
     };

     const closeOverlay = () => {
          setIsOverlayOpen(false);
      };


    if (loading) {
        return <Loader />;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!userInfo) {
        return <div>User not found.</div>;
    }

    return (
        <div className={styles.userProfileContainer}>
            <div className={styles.profileHeader}>
                {userInfo.profileImageUrl && (
                    <Image
                        src={userInfo.profileImageUrl}
                        alt={`${userInfo.username}'s Profile`}
                        width={120}
                        height={120}
                        objectFit='cover'
                        className={styles.circularImage}
                        />
                )}
                 <div>
                   <h2 className={styles.usernameRole}>{userInfo.username} - {userInfo.role}</h2>
                   {userInfo?.shortBio && <p className={styles.shortBio}>{userInfo.shortBio}</p>}
                   {userInfo?.bio && <p className={styles.bio}>{userInfo.bio}</p>}
               </div>
            </div>
            <div className={styles.socialLinksContainer}>
                    {userInfo?.personalWebsite && (
                        <div className={styles.socialLinks}>
                            <a href={userInfo.personalWebsite} target="_blank" rel="noopener noreferrer" className={styles.link}>
                             <TbWorldWww />
                            </a>
                        </div>
                    )}
                   {userInfo?.instagramLink && (
                         <div className={styles.socialLinks}>
                             <a href={userInfo.instagramLink} target="_blank" rel="noopener noreferrer" className={styles.link}>
                                <FaInstagram />
                            </a>
                         </div>
                    )}
                   {userInfo?.linkedinLink && (
                     <div className={styles.socialLinks}>
                           <a href={userInfo.linkedinLink} target="_blank" rel="noopener noreferrer" className={styles.link}>
                                <FaLinkedin />
                           </a>
                     </div>
                  )}
                    {userInfo?.behanceLink && (
                       <div className={styles.socialLinks}>
                           <a href={userInfo.behanceLink} target="_blank" rel="noopener noreferrer" className={styles.link}>
                            <FaBehanceSquare />
                           </a>
                       </div>
                     )}
                   {userInfo?.twitterLink && (
                      <div className={styles.socialLinks}>
                            <a href={userInfo.twitterLink} target="_blank" rel="noopener noreferrer" className={styles.link}>
                             <FaSquareXTwitter />
                             </a>
                        </div>
                     )}
                     {userInfo?.tiktokLink && (
                         <div className={styles.socialLinks}>
                           <a href={userInfo.tiktokLink} target="_blank" rel="noopener noreferrer" className={styles.link}>
                           <AiFillTikTok />
                            </a>
                        </div>
                    )}
             </div>
           
             <div className={styles.countsContainer}>
                   <div className={styles.countBlock}>
                     <span className={styles.countLabel}>Friends</span>
                     <span className={styles.countNumber}>{userInfo?.friendCount || 0}</span>
                   </div>
                    <div className={styles.countBlock}>
                       <span className={styles.countLabel}>Projects</span>
                         <span className={styles.countNumber}>{userInfo?.projectCount || 0}</span>
                    </div>
             </div>

              <div className={styles.arrowContainer}>
                <IoIosArrowBack className={styles.testimonialArrow} onClick={handlePrevTestimonial} />
                  <div className={styles.testimonials}>
                   {testimonials && <div className={styles.testimonial}>{testimonials[testimonialIndex]}</div> }
                  </div>
                 <IoIosArrowForward className={styles.testimonialArrow}  onClick={handleNextTestimonial}/>
              </div>
        

             <div className={styles.buttonContainer}>
                <button className={styles.userButton}>Add Friend</button>
                 <button className={styles.userButton} onClick={openOverlay}>Invite to Project</button>
                <button className={styles.userButton}>Message</button>
                {isOverlayOpen && (
                    <ProjectInviteOverlay
                      receiverId={id}
                       onClose={closeOverlay}
                    />
                   )}
             </div>
        </div>
    );
};

export default UserProfilePage;