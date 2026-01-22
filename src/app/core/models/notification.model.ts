export enum NotificationType {
    SUCCESS = 'success',
    ERROR = 'error',
    WARNING = 'warning',
    INFO = 'info'
}

export interface Notification {
    id?: string;
    type: NotificationType;
    title?: string;
    message: string;
    duration?: number; 
    dismissible?: boolean;
}
