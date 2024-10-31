import React, { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabaseClient/supabase';
import styles from './VerifyEmail.module.css';

const VerifyEmail: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [message, setMessage] = useState('');

  const supabase = getSupabaseClient();

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cooldown > 0) {
      setMessage(`Please wait ${cooldown} seconds before resending the email.`);
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const emailLower = email.toLowerCase();

      // Use Supabase's resend method
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: emailLower,
        options: {
          emailRedirectTo: 'http://localhost:3000'
        }
      });

      if (error) {
        setMessage(`Error sending verification email: ${error.message}`);
      } else {
        setMessage('Verification email sent! Please check your inbox.');
        setCooldown(60); // Start the 60-second cooldown
      }
    } catch (error) {
      console.error('Error resending verification email:', error);
      setMessage('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cooldown === 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  return (
    <div className={styles.overlay}>
      <div className={styles.cardContainer}>
        <div className={styles.card}>
          <div className={styles.content}>
            <div className={styles.description}>
              <h2>Please Verify Your Email</h2>
              <p>
                We have sent a confirmation email to your email address. Please check your inbox and
                click on the confirmation link to verify your email.
              </p>
              <p>If you did not receive an email, please check your spam folder.</p>
            </div>
            <div className={styles.formContainer}>
              <form onSubmit={handleResendVerification}>
                <p>
                  Still don&apos;t see the email? Please enter your email to resend the verification link:
                </p>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className={styles.input}
                />
                <button type="submit" disabled={loading || cooldown > 0} className={styles.button}>
                  {loading ? 'Sending...' : 'Resend Verification Email'}
                </button>
                {cooldown > 0 && (
                  <p className={styles.error}>
                    You can resend the email in {cooldown} seconds.
                  </p>
                )}
                {message && (
                  <p className={message.includes('Error') ? styles.error : styles.success}>
                    {message}
                  </p>
                )}
              </form>
             
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
