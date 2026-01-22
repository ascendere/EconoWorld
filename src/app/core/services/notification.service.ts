// src/app/core/services/notification.service.ts

import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { Notification, NotificationType } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new Subject<Notification>();
  public notification$: Observable<Notification> = this.notificationSubject.asObservable();

  constructor() { }

  show(notification: Notification): void {
    notification.id = this.generateId();
    notification.duration = notification.duration || 5000;
    notification.dismissible = notification.dismissible !== false;

    this.notificationSubject.next(notification);
  }

  success(message: string, title: string = '¡Éxito!'): void {
    this.show({
      type: NotificationType.SUCCESS,
      title,
      message
    });
  }

  error(message: string, title: string = 'Error'): void {
    this.show({
      type: NotificationType.ERROR,
      title,
      message,
      duration: 7000 
    });
  }

  warning(message: string, title: string = 'Advertencia'): void {
    this.show({
      type: NotificationType.WARNING,
      title,
      message
    });
  }

  info(message: string, title: string = 'Información'): void {
    this.show({
      type: NotificationType.INFO,
      title,
      message
    });
  }

  private generateId(): string {
    return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}