import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-econovideos',
  templateUrl: './econovideos.component.html',
  styleUrls: ['./econovideos.component.scss']
})
export class EconoVideosComponent {
  videos = Array(6).fill({
    imagen: 'assets/images/figma1.jpg'
  });

  constructor(private router: Router) {}

  iniciar(): void {
    this.router.navigate(['/econovideos']);
  }
}
