'use client';

import React from 'react';
import styles from './TermsAndConditions.module.css';

const TermsAndConditions: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Terms and Conditions for Collab-Hub</h1>
      <p>Effective Date: [Insert Date]</p>

      <section className={styles.section}>
        <h2>1. Introduction</h2>
        <p>
          Welcome to <strong>Collab-Hub</strong>! By using our platform, you agree to comply with these Terms and
          Conditions. If you do not agree, please do not use our services.
        </p>
      </section>

      <section className={styles.section}>
        <h2>2. Description of Service</h2>
        <p>
          Collab-Hub is a project management and collaboration platform where users can create and
          manage projects, message each other, and share documents.
        </p>
      </section>

      <section className={styles.section}>
        <h2>3. Account Creation</h2>
        <p>
          To use our platform, you must provide a valid email address and accept these Terms. We
          collect and manage your data as described in our Privacy Policy.
        </p>
      </section>

      <section className={styles.section}>
        <h2>4. Subscription Plans</h2>
        {/* Removed <p> and replaced it with <div> */}
        <div className={styles.div}>
          We offer two tiers:
          <ul>
            <li><strong>Free Plan</strong>: Access to basic features.</li>
            <li><strong>$5/month Plan</strong>: Additional premium features (handled via Stripe).</li>
          </ul>
        </div>
      </section>

      <section className={styles.section}>
        <h2>5. Payments</h2>
        <p>
          Payments are processed monthly through <strong>Stripe</strong>. By subscribing, you agree to Stripe’s
          terms and conditions for billing.
        </p>
      </section>

      <section className={styles.section}>
        <h2>6. Termination of Service</h2>
        <p>
          We reserve the right to terminate your account if you upload inappropriate content,
          engage in harassment, or violate any applicable laws.
        </p>
      </section>

      <section className={styles.section}>
        <h2>7. Dispute Resolution</h2>
        <p>
          In case of disputes, we aim to resolve issues through <strong>mediation</strong>. Further dispute
          resolution mechanisms may be provided as needed.
        </p>
      </section>

      <section className={styles.section}>
        <h2>8. Liability</h2>
        <p>
          We use <strong>Supabase</strong> (hosted on AWS) to manage and store data securely. While we take
          reasonable measures to protect your data, we are not liable for security breaches caused
          by external factors.
        </p>
      </section>

      <section className={styles.section}>
        <h2>9. Copyright and Intellectual Property</h2>
        <p>
          You retain ownership of any content you create on Collab-Hub. In the future, we will
          secure copyright for the platform itself.
        </p>
      </section>

      <section className={styles.section}>
        <h2>10. Changes to the Terms</h2>
        <p>
          We may modify these Terms occasionally. Please review them regularly to stay informed of
          updates.
        </p>
      </section>
    </div>
  );
};

export default TermsAndConditions;
