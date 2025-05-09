// src/app/utilities/api-diagnostics.ts
import { environment } from '../services/environment';

export function logApiError(component: string, action: string, error: any): void {
    if (environment.logLevel === 'debug' || environment.logLevel === 'info') {
        console.group(`API Error in ${component} - ${action}`);
        console.error('Error object:', error);
        console.error('Status:', error.status);
        console.error('Message:', error.message);
        console.error('API URL attempted:', error.url);
        console.info('Environment API URL:', environment.apiUrl);

        // Teste de conectividade básica
        if (typeof fetch !== 'undefined') {
            console.info('Testing basic connectivity to API base URL...');
            const baseUrl = environment.apiUrl.split('/api')[0];
            fetch(baseUrl)
                .then(response => {
                    console.info('Basic connectivity test:', response.ok ? 'SUCCESS' : 'FAILED');
                })
                .catch(err => {
                    console.error('Cannot connect to API server at all:', err);
                });
        }

        console.groupEnd();
    }
}