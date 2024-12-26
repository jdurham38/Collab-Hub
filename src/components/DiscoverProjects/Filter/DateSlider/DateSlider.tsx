import React from 'react';
import styles from './DateSlider.module.css';

type DateRangeValue =  0 | 1 | 7 | 30 | 'this_month' | 'last_month'

interface DateSliderProps {
    onSelect: (days: DateRangeValue) => void;
     selected: DateRangeValue
}

const DateSlider: React.FC<DateSliderProps> = ({ onSelect, selected }) => {

    interface TimeRange {
         label: string;
         value: DateRangeValue;
    }

    const timeRanges: TimeRange[] = [
        { label: 'Today', value: 0 },
        { label: 'Yesterday', value: 1 },
        { label: 'Last 7 Days', value: 7 },
        { label: 'Last 30 Days', value: 30 },
        { label: 'This Month', value: 'this_month' },
        { label: 'Last Month', value: 'last_month' },
    ];


    const handleRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const rangeValue = e.target.value as DateRangeValue;
        onSelect(rangeValue);
    };


    return (
        <div className={styles.sliderContainer}>
            <h3 className={styles.title}>Select Date Range</h3>
            <select
                className={styles.select}
                value={selected}
                onChange={handleRangeChange}
            >
                {timeRanges.map((range) => (
                    <option key={range.value} value={range.value}>
                        {range.label}
                    </option>
                ))}
            </select>

        </div>
    );
};

export default DateSlider;