import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent {
  constructor(private router: Router, private authService: AuthService) {}

  goTo(path: string) {
    this.authService.checkAuthentication().subscribe(isAuth => {
      if (isAuth) {
        this.router.navigate([`/admin/${path}`]);
      } else {
        this.authService.triggerLoginModal(`/admin/${path}`);
      }
    });
  }
} 