import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './econopley.component.html',
  styleUrls: ['./econopley.component.scss']
})
export class EconoPlayComponent {

  constructor(private router: Router) {}

iniciar(): void {
  this.router.navigate(['/econopley']);
}

}