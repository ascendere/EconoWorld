import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-econopley1',
  templateUrl: './econopley1.component.html',
  styleUrls: ['./econopley1.component.scss']
})
export class Econopley1Component {
  juegos = Array(9).fill({
    imagen: 'assets/images/Eonli.png',
    titulo: 'SimCity BuildIt',
    categoria: 'Economía urbana / Gestión',
    genero: 'Simulación / Estrategia'
  });

  constructor(private router: Router) {}

  regresar(): void {
    this.router.navigate(['/econoplay']);
  }
}
