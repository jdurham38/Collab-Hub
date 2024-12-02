// File: components/EditMessageForm/EditMessageForm.tsx

import React, { useState } from 'react';
import styles from './EditMessageForm.module.css';

interface EditMessageFormProps {
  messageId: string;
  currentContent: string;
  onEditConfirm: (messageId: string, editedContent: string) => void;
  onCancel: () => void;
}

const EditMessageForm: React.FC<EditMessageFormProps> = ({
  messageId,
  currentContent,
  onEditConfirm,
  onCancel,
}) => {
  const [editedContent, setEditedContent] = useState(currentContent);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editedContent.trim()) {
      onEditConfirm(messageId, editedContent.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.editForm}>
      <textarea
        value={editedContent}
        onChange={(e) => setEditedContent(e.target.value)}
        className={styles.textArea}
      />
      <div className={styles.buttons}>
        <button type="submit" className={styles.saveButton}>Save</button>
        <button type="button" onClick={onCancel} className={styles.cancelButton}>Cancel</button>
      </div>
    </form>
  );
};

export default EditMessageForm;
