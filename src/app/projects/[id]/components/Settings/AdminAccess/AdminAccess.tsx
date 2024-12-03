// components/GrantAdminForm.tsx
import React, { useState, FormEvent } from 'react';
import { grantAdminAccess } from '@/services/ProjectSettings/adminAccess';

interface GrantAdminFormProps {
  projectId: string;
  // You can pass additional props as needed, such as a list of users or callback functions
}

const GrantAdminForm: React.FC<GrantAdminFormProps> = ({ projectId }) => {
  const [userId, setUserId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const collaborator = await grantAdminAccess(projectId, userId);
      setSuccessMessage(`Admin privileges granted to user: ${collaborator.userId}`);
      setUserId(''); // Clear the input field
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Grant Admin Access</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label htmlFor="userId" style={styles.label}>
            User ID:
          </label>
          <input
            type="text"
            id="userId"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
            style={styles.input}
            placeholder="Enter User ID"
          />
        </div>
        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Granting...' : 'Grant Admin Access'}
        </button>
      </form>
      {successMessage && <p style={styles.success}>{successMessage}</p>}
      {errorMessage && <p style={styles.error}>{errorMessage}</p>}
    </div>
  );
};

// Simple inline styles for demonstration purposes
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '400px',
    margin: '0 auto',
    padding: '1rem',
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  formGroup: {
    marginBottom: '1rem',
  },
  label: {
    marginBottom: '0.5rem',
    display: 'block',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    padding: '0.5rem',
    fontSize: '1rem',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  button: {
    padding: '0.75rem',
    fontSize: '1rem',
    backgroundColor: '#0070f3',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  success: {
    marginTop: '1rem',
    color: 'green',
  },
  error: {
    marginTop: '1rem',
    color: 'red',
  },
};

export default GrantAdminForm;
