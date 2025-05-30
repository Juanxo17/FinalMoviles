import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { AuthStateService } from '../../services/auth-state.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-welcome',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-title>Bienvenido</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding ion-text-center">
      <ion-card>
        <ion-card-header>
          <ion-card-title>Inicio de sesión exitoso</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <p>¡Has iniciado sesión correctamente!</p>
          <p>Esta es una página temporal de bienvenida.</p>
          
          <ion-button expand="block" color="danger" (click)="logout()" class="ion-margin-top">
            Cerrar Sesión
          </ion-button>
        </ion-card-content>
      </ion-card>
    </ion-content>
  `,
  standalone: true,
  imports: [
    CommonModule,
    IonicModule
  ]
})
export class WelcomePage {
  constructor(
    private authStateService: AuthStateService,
    private router: Router
  ) {}

  logout() {
    this.authStateService.logout();
    this.router.navigate(['/login']);
  }
}
