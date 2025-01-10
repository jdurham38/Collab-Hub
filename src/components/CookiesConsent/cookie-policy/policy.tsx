import React from 'react';
import styles from './CookiePolicy.module.css';

const CookiesPolicy: React.FC = () => {
  return (
    <div className={styles.policyContainer}>
      <h1>Cookies Policy</h1>
      <p>Last updated: [Insert Date]</p>

      <h2>Introduction</h2>
      <p>
        We use cookies on our website to enhance your browsing experience. This
        Cookies Policy explains what cookies are, how we use them, and your
        choices regarding cookies.
      </p>

      <h2>What Are Cookies?</h2>
      <p>
        Cookies are small text files stored on your device (computer, tablet, or
        mobile) when you visit certain websites. They help the website recognize
        your device and remember your preferences over time.
      </p>

      <h2>How We Use Cookies</h2>
      <p>We use cookies for various purposes, including:</p>
      <ul>
        <li>
          <strong>Essential Cookies:</strong> These cookies are necessary for
          the website to function properly. They enable core functionalities
          such as security, network management, and accessibility.
        </li>
        <li>
          <strong>Performance and Analytics Cookies:</strong> These cookies
          collect information about how you interact with our website, helping
          us understand usage patterns and improve our services.
        </li>
      </ul>

      <h2>User Sessions and Data Use</h2>
      <p>
        When you create an account or log in to our website, we store your
        session information to authenticate your identity and provide secure
        access to your account. These user sessions are temporary and will
        expire after a set period of inactivity, enhancing your security and
        protecting your privacy.
      </p>
      <p>
        <strong>If you decline cookies:</strong> We will still use your session
        information solely for user authentication purposes. We will not store
        or use your personal information beyond what is necessary for securely
        logging you in and managing your session.
      </p>

      <h2>Your Choices Regarding Cookies</h2>
      <p>
        You have the option to accept or decline cookies. Most web browsers
        automatically accept cookies, but you can usually modify your browser
        settings to decline cookies if you prefer. Please note that disabling
        cookies may prevent you from taking full advantage of the website.
      </p>

      <h2>Third-Party Cookies</h2>
      <p>
        We may allow third-party service providers to place cookies on your
        device for analytics and advertising purposes. These third parties have
        their own privacy policies and may use their cookies to target
        advertising to you on other websites.
      </p>

      <h2>Changes to This Cookies Policy</h2>
      <p>
        We may update this Cookies Policy from time to time to reflect changes
        in our practices or for other operational, legal, or regulatory reasons.
        Any updates will be posted on this page with an updated revision date.
      </p>

      <h2>Contact Us</h2>
      <p>
        If you have any questions or concerns about our use of cookies, please
        contact us at:
      </p>
      <p>
        Email:{' '}
        <a href="mailto:joshswebdevelopment@gmail.com">
          joshswebdevelopment@gmail.com
        </a>
        <br />
      </p>
    </div>
  );
};

export default CookiesPolicy;
