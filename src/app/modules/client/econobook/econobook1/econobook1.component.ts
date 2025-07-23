import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-econobook1',
  templateUrl: './econobook1.component.html',
  styleUrls: ['./econobook1.component.scss']
})
export class Econobook1Component {

  constructor(private router: Router) {}

  regresar(): void {
    this.router.navigate(['/econobook']);
  }
}
