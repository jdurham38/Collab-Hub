import React, { useState } from 'react';
import styles from './TagsSelector.module.css';
import { projectTags } from '@/utils/tags';

interface TagsSelectorProps {
  selectedTags: string[];
  setSelectedTags: React.Dispatch<React.SetStateAction<string[]>>;
}

const TagsSelector: React.FC<TagsSelectorProps> = ({ selectedTags, setSelectedTags }) => {
  const [tagSearch, setTagSearch] = useState('');
  const [selectedTagCategory, setSelectedTagCategory] = useState<string | null>(null);

  const handleTagSelection = (tag: string) => {
    setSelectedTags((prevTags) => {
      // If the tag is already selected, remove it
      if (prevTags.includes(tag)) {
        return prevTags.filter((t) => t !== tag);
      }
      // If the user tries to add a tag and has already selected 5 tags, do nothing
      if (prevTags.length >= 5) {
        alert('You can only select up to 5 tags.');
        return prevTags;
      }

      return [...prevTags, tag];
    });
  };

  const handleTagRemove = (tag: string) => {
    setSelectedTags((prevTags) => prevTags.filter((t) => t !== tag));
  };

  const filteredTags = Object.entries(projectTags).flatMap(([category, tagsList]) =>
    selectedTagCategory && selectedTagCategory !== category
      ? []
      : (tagsList as string[])
          .filter((tag: string) => tag.toLowerCase().includes(tagSearch.toLowerCase()))
          .map((tag) => ({ category, tag }))
  );

  return (
    <div>
      <h3>Select Tags (Limit of 5)</h3>

      {/* Selected tags container */}
      <div className={styles.selectedTagsContainer}>
        {selectedTags.map((tag) => (
          <div key={tag} className={styles.selectedTag}>
            {tag}
            <button onClick={() => handleTagRemove(tag)} className={styles.removeTagButton}>
              &times;
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

      {/* Filtered tags for selection */}
      <div className={styles.tagsContainer}>
        {filteredTags.map(({ category, tag }) => (
          <label key={`${category}-${tag}`} className={styles.tagCheckboxLabel}>
            <input
              type="checkbox"
              checked={selectedTags.includes(tag)}
              onChange={() => handleTagSelection(tag)}
              disabled={!selectedTags.includes(tag) && selectedTags.length >= 5} // Disable if max tags reached
            />
            {tag} <span className={styles.tagCategoryLabel}>({category})</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default TagsSelector;
