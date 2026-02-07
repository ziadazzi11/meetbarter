import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/config/api';

interface SystemConfig {
    whishPhoneNumber: string;
    omtPhoneNumber?: string;
    isCrisisActive: boolean;
}

export function useSystemConfig() {
    const [config, setConfig] = useState<SystemConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch(`${API_BASE_URL}/system/config/public`)
            .then(res => res.json())
            .then(data => {
                setConfig(data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch system config:', err);
                // Fallback to defaults to prevent crash
                setConfig({
                    whishPhoneNumber: '71023083', // Fallback
                    isCrisisActive: true
                });
                setIsLoading(false);
            });
    }, []);

    return { config, isLoading };
}
