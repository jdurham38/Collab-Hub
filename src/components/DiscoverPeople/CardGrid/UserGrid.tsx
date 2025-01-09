'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import UserCard from '../UserCard/UserCard';
import styles from './UserGrid.module.css';
import { User } from '@/utils/interfaces';
import { useRouter } from 'next/navigation';
import { fetchUsers } from '@/services/DiscoverPeople/discoverPeopleService';
import UserFilter from '../Filter/Filter';

interface UserGridProps {
    userId?: string;
}

interface FilterState {
    roles: string[];
    dateRange: string;
    searchTerm: string;
}

const UserGrid: React.FC<UserGridProps> = ({ userId }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const usersPerPage = 6;
    const [totalUsers, setTotalUsers] = useState<number>(0);
    const router = useRouter();
    const [filters, setFilters] = useState<FilterState>({ roles: [], dateRange: '', searchTerm: '' });
    const previousFilters = useRef<FilterState | null>(null);

    const handleFilterChange = useCallback((newFilters: { roles: string[]; dateRange: string; searchTerm: string }) => {
        setFilters(newFilters);
    }, [setFilters]);

    useEffect(() => {
        const loadUsers = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await fetchUsers(currentPage, usersPerPage, filters, filters.searchTerm);
                setUsers(data.users);
                setTotalUsers(data.totalCount);
            } catch (e) {
                let errorMessage = 'An unknown error occurred while fetching users.';
                if (e instanceof Error) {
                    errorMessage = e.message || 'An error occurred while fetching users.';
                } else if (typeof e === 'string') {
                    errorMessage = e;
                }
                setError(errorMessage);
                console.error('Error fetching users: ', e);
            } finally {
                setLoading(false);
            }
        };
        if(previousFilters.current === null || JSON.stringify(previousFilters.current) !== JSON.stringify(filters)){
            loadUsers();
            previousFilters.current = filters;
        }
    }, [currentPage, userId, usersPerPage, filters, filters.searchTerm]);

    useEffect(() => {
        setCurrentPage(1);
    }, [userId]);

    const handleViewProfile = (id: string) => {
        router.push(`/user/${id}`);
    };

    const totalPages = Math.ceil(totalUsers / usersPerPage);

    const handleNextPage = () => {
        setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
    };

    const handlePrevPage = () => {
        setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
    };


    if (loading) {
        return <div className={styles.loading}>Loading users...</div>;
    }

    if (error) {
        return <div className={styles.error}>Error: {error}</div>;
    }

    return (
        <div className={styles.gridContainer}>
            <UserFilter onFilterChange={handleFilterChange} initialFilters={filters} />
            <div className={styles.container}>
                {users.length === 0 ? (
                    <div className={styles.noUsers}>No users found.</div>
                ) : (
                    <div className={styles.grid}>
                        {users.map((user) => (
                            <UserCard key={user.id} userInfo={user} onViewProfile={handleViewProfile} />
                        ))}
                    </div>
                )}
                <div className={styles.pagination}>
                    <button onClick={handlePrevPage} disabled={currentPage === 1}>
                        Previous
                    </button>
                    <span>
                        Page {currentPage} of {totalPages}
                    </span>
                    <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserGrid;