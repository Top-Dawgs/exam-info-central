
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="max-w-md text-center">
        <h1 className="text-6xl font-extrabold text-red-600 mb-4">401</h1>
        <h2 className="text-2xl font-bold mb-2">Unauthorized Access</h2>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page. Please contact your administrator if you think this is an error.
        </p>
        <div className="space-x-4">
          <Button 
            onClick={() => navigate('/')}
            variant="default"
          >
            Go to Dashboard
          </Button>
          <Button 
            onClick={() => navigate(-1)}
            variant="outline"
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
