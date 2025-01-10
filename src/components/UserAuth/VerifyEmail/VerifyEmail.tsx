import React, { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabaseClient/supabase';
import styles from './VerifyEmail.module.css';

const VerifyEmail: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const supabase = getSupabaseClient();

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cooldown > 0) {
      setErrorMessage(
        `Please wait ${cooldown} second${cooldown !== 1 ? 's' : ''} before resending the email.`,
      );
      setSuccessMessage('');
      return;
    }

    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const emailLower = email.toLowerCase();

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: emailLower,
        options: {
          emailRedirectTo: 'http://localhost:3000',
        },
      });

      if (error) {
        setErrorMessage(`Error sending verification email: ${error.message}`);
      } else {
        setSuccessMessage('Verification email sent! Please check your inbox.');
        setCooldown(60);
      }
    } catch (error) {
      console.error('Error resending verification email:', error);
      setErrorMessage('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setTimeout(() => {
      setCooldown((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearTimeout(timer);
  }, [cooldown]);

  return (
    <div className={styles.overlay}>
      <div className={styles.cardContainer}>
        <div className={styles.card}>
          <div className={styles.content}>
            <div className={styles.description}>
              <h2>Please Verify Your Email</h2>
              <p>
                We have sent a confirmation email to your email address. Please
                check your inbox and click on the confirmation link to verify
                your email.
              </p>
              <p>
                If you did not receive an email, please check your spam folder.
              </p>
            </div>
            <div className={styles.formContainer}>
              <form onSubmit={handleResendVerification}>
                <p>
                  Still don&apos;t see the email? Please enter your email to
                  resend the verification link:
                </p>
                <label htmlFor="email" className={styles.label}>
                  Email Address:
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className={styles.input}
                />
                <button
                  type="submit"
                  disabled={loading || cooldown > 0}
                  className={styles.button}
                >
                  {loading ? 'Sending...' : 'Resend Verification Email'}
                </button>
                {cooldown > 0 && (
                  <p className={styles.error}>
                    You can resend the email in {cooldown} second
                    {cooldown !== 1 ? 's' : ''}.
                  </p>
                )}
                {successMessage && (
                  <p className={styles.success}>{successMessage}</p>
                )}
                {errorMessage && <p className={styles.error}>{errorMessage}</p>}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
