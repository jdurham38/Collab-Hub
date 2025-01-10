import React, { useState, useEffect } from 'react';
import styles from './index.module.css';
import { projectTags } from '@/utils/tags';

interface EditTagsProps {
  tags: string[];
  setTags: (tags: string[]) => void;
}

const EditTags: React.FC<EditTagsProps> = ({ tags, setTags }) => {
  const [tagSearch, setTagSearch] = useState('');
  const [selectedTagCategory, setSelectedTagCategory] = useState<string | null>(
    null,
  );

  useEffect(() => {
    setSelectedTags(tags);
  }, [tags]);

  const [selectedTags, setSelectedTags] = useState<string[]>(tags);

  const handleTagSelection = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : selectedTags.length < 5
        ? [...selectedTags, tag]
        : selectedTags;

    setSelectedTags(newTags);
    setTags(newTags);
  };

  const handleTagRemove = (tag: string) => {
    const newTags = selectedTags.filter((t) => t !== tag);
    setSelectedTags(newTags);
    setTags(newTags);
  };

  const filteredTags = Object.entries(projectTags).flatMap(
    ([category, tagsList]) =>
      selectedTagCategory && selectedTagCategory !== category
        ? []
        : (tagsList as string[])
            .filter((tag) =>
              tag.toLowerCase().includes(tagSearch.toLowerCase()),
            )
            .map((tag) => ({ category, tag })),
  );

  return (
    <div className={styles.editTagsContainer}>
      <h2>
        <b>Edit Tags:</b>
      </h2>
      <h3 className={styles.title}>Select Tags (Limit of 5)</h3>

      <div className={styles.selectedTagsContainer}>
        {selectedTags.map((tag) => (
          <div key={tag} className={styles.selectedTag}>
            {tag}
            <button
              onClick={() => handleTagRemove(tag)}
              className={styles.removeTagButton}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <input
        type="text"
        placeholder="Search tags"
        value={tagSearch}
        onChange={(e) => setTagSearch(e.target.value)}
        className={styles.searchInput}
      />

      <select
        onChange={(e) => setSelectedTagCategory(e.target.value || null)}
        className={styles.categorySelect}
      >
        <option value="">All Categories</option>
        {Object.keys(projectTags).map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>

      <div className={styles.tagsContainer}>
        {filteredTags.map(({ category, tag }) => (
          <label key={`${category}-${tag}`} className={styles.tagCheckboxLabel}>
            <input
              type="checkbox"
              checked={selectedTags.includes(tag)}
              onChange={() => handleTagSelection(tag)}
              disabled={!selectedTags.includes(tag) && selectedTags.length >= 5}
            />
            {tag} <span className={styles.tagCategoryLabel}>({category})</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default EditTags;
