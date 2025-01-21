// src/pages/discover/index.tsx
'use client';

import React from 'react';
import DiscoverProjects from '@/components/DiscoverProjects/DiscoverProjects';
import { useAuth } from '@/contexts/AuthContext';


export default function DiscoverPage() {

    return (
      <div>
        <DiscoverProjects />
      </div>
    );
  }