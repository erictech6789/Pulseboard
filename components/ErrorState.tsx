
import React from 'react';

interface ErrorStateProps {
  title: string;
  description: string;
  onRetry?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  title,
  description,
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-4 text-center">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
        {title}
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-4">{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorState;
