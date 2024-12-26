import React, { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import styles from './navbar.module.css';
import PlanLimitModal from '../PlanModals/PlanLimitModal';
import { checkPlanAndProjects } from '@/services/navServices';
import { toast, ToastContainer } from 'react-toastify';
import CreateProject from '../Projects/CreateProject/CreateProject';
import axios from 'axios';
import Link from 'next/link'; 
const Navbar = () => {
  const { session, isLoggedIn } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPlanLimitModalOpen, setIsPlanLimitModalOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const openModal = async () => {
    if (!isLoggedIn || !session) {
      toast.error('You must be logged in to create a project.');
      return;
    }

    try {
      const userId = session.user.id;

            await checkPlanAndProjects(userId);

            setIsModalOpen(true);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          setIsPlanLimitModalOpen(true);
        } else {
          toast.error(
            error.response?.data?.error || 'An error occurred. Please try again.'
          );
        }
      } else {
                const errorMessage =
          error instanceof Error ? error.message : 'An unexpected error occurred.';
        toast.error(errorMessage);
      }
    }
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.leftSection}>
        {/* Add Link to Dashboard */}
        <Link href="/dashboard" className={styles.navLink}>
          Dashboard
        </Link>
        <Link href="/discover-projects" className={styles.navLink}>
          Discover Projects
        </Link>
        <button className={styles.createButton} onClick={openModal}>
          +
        </button>
      </div>
      <div className={styles.rightSection}>
        <div className={styles.profile}>
          <span className={styles.username} onClick={toggleDropdown}>
            {session?.user?.email || 'Guest'}
          </span>
          {dropdownOpen && (
            <div className={styles.dropdown}>
              {/* Add dropdown items if needed */}
            </div>
          )}
        </div>
      </div>

      {/* Modal for CreateProject */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <CreateProject onClose={() => setIsModalOpen(false)} />
        </div>
      )}

      {/* Plan Limit Modal */}
      {isPlanLimitModalOpen && (
        <PlanLimitModal onClose={() => setIsPlanLimitModalOpen(false)} />
      )}

      <ToastContainer />
    </nav>
  );
};

export default Navbar;
