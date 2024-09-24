// app/login/page.tsx
"use client"
import React from 'react';
import LoginForm from '@/components/UserAuth/Login/login';
export default function LoginPage() {
  return (
    <div>
      <h1>Login</h1>
      <LoginForm />
    </div>
  );
}
