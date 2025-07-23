import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './econonew.component.html',
  styleUrls: ['./econonew.component.scss']
})
export class EconoNewsComponent {
  showChat = false;

  constructor(private router: Router) {}

  toggleChat() {
    this.showChat = !this.showChat;
  }

  iniciar(): void {
    // Redirige a la pantalla de temáticas
    this.router.navigate(['/econonews']);
  }
}