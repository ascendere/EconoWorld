import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
    selector: 'app-dashboard',
    templateUrl: './econobot.component.html',
    styleUrls: ['./econobot.component.scss']
})
export class EconoBotComponent {

    constructor(private router: Router) { }

    iniciar(): void {
        // Redirige a la pantalla de temáticas
        this.router.navigate(['/tematica']);
    }
}