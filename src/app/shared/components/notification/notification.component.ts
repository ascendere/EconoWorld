// src/app/shared/components/notification/notification.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../../core/services/notification.service';
import { Notification, NotificationType } from '../../../core/models/notification.model';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(120%)', opacity: 0 }),
        animate('400ms cubic-bezier(0.68, -0.55, 0.265, 1.55)', 
          style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-out', 
          style({ transform: 'translateX(120%)', opacity: 0 }))
      ])
    ])
  ]
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  private subscription!: Subscription;

  NotificationType = NotificationType;

  constructor(private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.subscription = this.notificationService.notification$.subscribe(
      (notification: Notification) => {
        this.addNotification(notification);
      }
    );
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private addNotification(notification: Notification): void {
    this.notifications.push(notification);

    // Auto-eliminar después del tiempo especificado
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        this.removeNotification(notification.id!);
      }, notification.duration);
    }
  }

  removeNotification(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
  }

  getNotificationClass(type: NotificationType): string {
    return `notification-${type}`;
  }

  getIcon(type: NotificationType): string {
    switch (type) {
      case NotificationType.SUCCESS:
        return '✓';
      case NotificationType.ERROR:
        return '✕';
      case NotificationType.WARNING:
        return '⚠';
      case NotificationType.INFO:
        return 'ℹ';
      default:
        return 'ℹ';
    }
  }
}