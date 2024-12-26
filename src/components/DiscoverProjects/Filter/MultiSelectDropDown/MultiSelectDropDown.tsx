// MultiSelectDropdown.tsx
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
    const dropdownRef = useRef<HTMLDivElement>(null);

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
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

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
          if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setIsOpen(false);
          }
        };
    
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
          document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [dropdownRef]);


    return (
        <div className={styles.dropdownContainer} ref={dropdownRef}>
            <div className={styles.dropdownHeader} onClick={toggleDropdown}>
                <span>{label}</span>
                <span className={styles.selectedIndicator}>
                     {selected.length > 0 ? selected.join(', ') : "Select Options"}
                </span>
                  <span className={styles.arrow}>{isOpen ? '▲' : '▼'}</span>
            </div>
            {isOpen && (
                <div className={styles.dropdownList}>
                    {options.map((option) => (
                        <label key={option} className={styles.optionLabel}>
                            <input
                                type="checkbox"
                                checked={selected.includes(option)}
                                onChange={() => handleOptionChange(option)}
                            />
                            {option}
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MultiSelectDropdown;