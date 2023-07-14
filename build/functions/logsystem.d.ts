export function log(message: any, title: any): Promise<void>;
export function error(message: any, error?: {
    stack: string;
}, title?: string): Promise<void>;
export function warn(message: any, title?: string): Promise<void>;
