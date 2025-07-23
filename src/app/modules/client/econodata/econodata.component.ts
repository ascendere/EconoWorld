import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './econodata.component.html',
  styleUrls: ['./econodata.component.scss']
})
export class EconoDataComponent {

  constructor(private router: Router) {}

  iniciar(): void {
    
    this.router.navigate(['/econodata']);
  }
}