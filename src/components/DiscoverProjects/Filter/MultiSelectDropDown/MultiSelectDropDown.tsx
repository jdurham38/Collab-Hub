import React, { useState, useRef, useEffect } from 'react';
import styles from './MultiSelectDropdown.module.css';

interface MultiSelectDropdownProps {
    options: string[];
    selected: string[];
    onSelect: (selectedOptions: string[]) => void;
    label: string;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({ options, selected, onSelect, label }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
      const [isFocused, setIsFocused] = useState(false);


    const toggleDropdown = () => {
        setIsOpen(!isOpen);
        setIsFocused(true);
    };


    const handleRemoveSelection = (optionToRemove: string) => {
        const newSelected = selected.filter(item => item !== optionToRemove);
        onSelect(newSelected);
    };

    const handleOptionChange = (option: string) => {
        let newSelected = [...selected];
        if (newSelected.includes(option)) {
            newSelected = newSelected.filter((item) => item !== option);
        } else {
            newSelected.push(option);
        }
        onSelect(newSelected);
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
    };

    // Filter options based on the search term
    const filteredOptions = options.filter(option =>
        option.toLowerCase().includes(searchTerm.toLowerCase())
    );

       // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm('')
                setIsFocused(false); // Remove focus state on close
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownRef]);

    return (
        <div className={styles.dropdownContainer} ref={dropdownRef}>
            <div className={`${styles.dropdownHeader} ${isFocused ? styles.dropdownHeaderFocused : ""}`} onClick={toggleDropdown}>
                <span>{label}</span>
                <span className={styles.placeholder}>
                  {selected.length === 0 && "Select Options"}
                </span>
                <span className={styles.arrow}>{isOpen ? '▲' : '▼'}</span>
            </div>
                <div className={styles.selectedOptionsContainer}>
                  {selected.map(option => (
                       <div key={option} className={styles.selectedOption}>
                            {option}
                          <span
                            className={styles.removeOption}
                            onClick={(e) => {e.stopPropagation(); handleRemoveSelection(option)}}
                            >
                              x
                            </span>
                       </div>
                     ))}
                  </div>
            {isOpen && (
                <div className={styles.dropdownList}>
                <input
                    type="text"
                    placeholder="Search options..."
                    className={styles.searchInput}
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                    {filteredOptions.map((option) => (
                        <label key={option} className={styles.optionLabel}>
                            <input
                                type="checkbox"
                                checked={selected.includes(option)}
                                onChange={() => handleOptionChange(option)}
                            />
                            {option}
                        </label>
                    ))}
                    {filteredOptions.length === 0 && <div className={styles.noOptions}>No options found</div>}
                </div>
            )}
        </div>
    );
};

export default MultiSelectDropdown;