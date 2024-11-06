"use client"

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import styles from './navbar.module.css';

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.leftSection}>
        <Link href="/dashboard" passHref>
          <span className={styles.navItem}>Dashboard</span>
        </Link>
        <Link href="/discover-projects" passHref>
          <span className={styles.navItem}>Discover Projects</span>
        </Link>
        <Link href="/discover-people" passHref>
          <span className={styles.navItem}>Discover People</span>
        </Link>
        <button className={styles.createButton}>+</button>
      </div>
      <div className={styles.rightSection}>
        <div className={styles.profile}>
          <span className={styles.username} onClick={toggleDropdown}>
            YourUsername
          </span>
          {dropdownOpen && (
            <div className={styles.dropdown}>
                        <Link href="/settings" passHref>

              <span className={styles.dropdownItem}>Settings</span>
              </Link>

            </div>
          )}
          <Image
            src="/path/to/default-profile.jpg" // Placeholder path
            alt="Profile Image"
            width={40}
            height={40}
            className={styles.profileImage}
          />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;