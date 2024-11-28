import React from 'react';
import styles from './PlanLimitModal.module.css';
import { useRouter } from 'next/navigation';

interface PlanLimitModalProps {
  onClose: () => void;
}

const PlanLimitModal: React.FC<PlanLimitModalProps> = ({ onClose }) => {
  const router = useRouter();

  const handleUpgradePlan = () => {
        router.push('/upgrade-plan');
    onClose();
  };

  const handleReturnToDashboard = () => {
        router.push('/dashboard');
    onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2 className={styles.modalTitle}>Plan Limit Reached</h2>
        <p className={styles.modalMessage}>
          Either upgrade your plan or return to the dashboard.
        </p>
        <div className={styles.modalActions}>
          <button className={styles.upgradeButton} onClick={handleUpgradePlan}>
            Upgrade Plan
          </button>
          <button className={styles.dashboardButton} onClick={handleReturnToDashboard}>
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlanLimitModal;
