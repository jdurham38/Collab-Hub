'use client';

import React from 'react';
import styles from './PrivacyPolicy.module.css';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Privacy Policy for Collab-Hub</h1>
      <p>Effective Date: [Insert Date]</p>

      <section className={styles.section}>
        <h2>1. Introduction</h2>
        <p>
          Welcome to <strong>Collab-Hub</strong>. We value your privacy and are committed to
          protecting your personal data. This Privacy Policy outlines how we collect, use, and
          safeguard your information when you use our platform.
        </p>
      </section>

      <section className={styles.section}>
        <h2>2. Information We Collect</h2>
        {}
        <div className={styles.div}>
          We collect the following information:
          <ul>
            <li><strong>Email Address</strong>: For account creation and management.</li>
            <li><strong>Profile Picture</strong>: For user identification and personalization.</li>
            <li><strong>Bio</strong>: To help others understand your background.</li>
            <li><strong>Location</strong>: For enhancing user experience.</li>
            <li><strong>Career Role</strong>: To better facilitate project collaboration.</li>
          </ul>
        </div>
      </section>

      <section className={styles.section}>
        <h2>3. How We Use Your Information</h2>
        {}
        <div className={styles.div}>
          Your personal information is used to:
          <ul>
            <li>Provide and maintain our service.</li>
            <li>Improve user experience.</li>
            <li>Manage user accounts and facilitate project collaboration.</li>
            <li>Process payments for subscription plans.</li>
          </ul>
        </div>
      </section>

      <section className={styles.section}>
        <h2>4. Data Storage and Security</h2>
        <p>
          We use <strong>Supabase</strong> to store your data securely on <strong>AWS servers</strong>.
          Supabase ensures your information is stored in compliance with international data security
          standards.
        </p>
      </section>

      <section className={styles.section}>
        <h2>5. Analytics</h2>
        <p>
          We use <strong>Google Analytics</strong> and <strong>PostHog</strong> to collect and analyze usage data, helping us
          improve the platform. No cookies are used for tracking purposes.
        </p>
      </section>

      <section className={styles.section}>
        <h2>6. Payment Processing</h2>
        <p>
          <strong>Stripe</strong> handles all billing and payment processing. We do not store any payment
          information.
        </p>
      </section>

      <section className={styles.section}>
        <h2>7. Your Rights</h2>
        <p>
          You have the right to access, correct, update, or delete your personal data. To exercise
          these rights, please contact us at <strong>[Insert Contact Email]</strong>.
        </p>
      </section>

      <section className={styles.section}>
        <h2>8. Account Termination</h2>
        <p>
          We reserve the right to terminate your account for inappropriate content, harassment, or
          violations of our <strong>Terms and Conditions</strong>.
        </p>
      </section>

      <section className={styles.section}>
        <h2>9. Changes to This Privacy Policy</h2>
        <p>
          We may update this policy periodically. Please check back regularly for updates.
        </p>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
