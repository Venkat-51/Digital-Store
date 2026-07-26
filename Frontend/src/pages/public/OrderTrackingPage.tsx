import React, { useState } from 'react';
import { TrackOrderModal } from '@/components/common/TrackOrderModal';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

export const OrderTrackingPage: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();

  const handleClose = () => {
    setIsOpen(false);
    navigate(ROUTES.HOME);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Tracking</h1>
        <p className="text-sm text-gray-600 mb-6">Opening Live Track Order Assistant...</p>
        <button
          onClick={() => setIsOpen(true)}
          className="px-6 py-3 bg-gray-950 text-white text-sm font-bold rounded-2xl hover:bg-black transition-all shadow-md"
        >
          Open Track Order
        </button>
      </div>

      <TrackOrderModal isOpen={isOpen} onClose={handleClose} />
    </div>
  );
};

export default OrderTrackingPage;
