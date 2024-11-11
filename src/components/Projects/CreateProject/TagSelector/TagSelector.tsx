// TagsSelector.tsx
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
    setSelectedTags((prevTags) =>
      prevTags.includes(tag) ? prevTags.filter((t) => t !== tag) : [...prevTags, tag]
    );
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
      <h3>Select Tags</h3>
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
            />
            {tag} <span className={styles.tagCategoryLabel}>({category})</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default TagsSelector;
