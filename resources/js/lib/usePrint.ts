// hooks/usePrint.ts
import { useEffect } from 'react';

export const usePrint = (autoPrint = false) => {
    const handlePrint = () => {
        const originalTitle = document.title;
        document.title = `Bulletin_Paie_${Date.now()}`;
        window.print();
        document.title = originalTitle;
    };

    useEffect(() => {
        if (autoPrint) {
            const timer = setTimeout(handlePrint, 500);
            return () => clearTimeout(timer);
        }
    }, [autoPrint]);

    return { handlePrint };
};