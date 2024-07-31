import { useState, useEffect } from 'react';

const useRelativeTime = (timestamp) => {
  const [relativeTime, setRelativeTime] = useState('');

  useEffect(() => {
    const updateRelativeTime = () => {
      const now = new Date();
      const timeDiff = now - new Date(timestamp);
      const seconds = Math.floor(timeDiff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (days > 0) {
        setRelativeTime(`${days} day${days > 1 ? 's' : ''} ago`);
      } else if (hours > 0) {
        setRelativeTime(`${hours} hour${hours > 1 ? 's' : ''} ago`);
      } else if (minutes > 0) {
        setRelativeTime(`${minutes} minute${minutes > 1 ? 's' : ''} ago`);
      } else {
        setRelativeTime(`${seconds} second${seconds > 1 ? 's' : ''} ago`);
      }
    };

    updateRelativeTime();
    const interval = setInterval(updateRelativeTime, 60000); // Update every minute

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [timestamp]);

  return relativeTime;
};

export default useRelativeTime;
