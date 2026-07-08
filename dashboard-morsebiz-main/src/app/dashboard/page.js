'use client';

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { initializeAuth } from '@/store/slices/authSlice';
import { DashboardCounters } from './components';



export default function DashboardPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);





  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="px-0 space-y-6">

        <DashboardCounters />
      </div>
    </div>
  );
}