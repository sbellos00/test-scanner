"use client";

interface LoadingIndicatorProps {
  show: boolean;
  message?: string;
}

export default function LoadingIndicator({ show, message = "Loading AR experience..." }: LoadingIndicatorProps) {
  if (!show) return null;
  
  return (
    <div className="loading-indicator">
      <div className="loading-spinner"></div>
      <p className="loading-message">{message}</p>
    </div>
  );
} 