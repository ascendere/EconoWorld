import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-econonews1',
  templateUrl: './econonews1.component.html',
  styleUrls: ['./econonews1.component.scss']
})
export class Econonews1Component {
    constructor(private router: Router) {}
    regresar(): void {
        this.router.navigate(['/econonews']);
      }
  // Aquí puedes agregar lógica para cargar la noticia, etc.
} 