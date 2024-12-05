// hooks/useBodyClass.ts
import { useEffect } from 'react';

const useBodyClass = (className: string) => {
  useEffect(() => {
    // Add the class to the body
    document.body.classList.add(className);

    // Cleanup function to remove the class
    return () => {
      document.body.classList.remove(className);
    };
  }, [className]);
};

export default useBodyClass;
