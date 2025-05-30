import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-favorites',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>
          Mis Favoritos
        </ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <ion-list>
        <!-- Lista de Favoritos -->
        <ion-item-group>
          <ion-item-divider>
            <ion-label>Sitios Favoritos</ion-label>
          </ion-item-divider>
          
          <ion-item *ngFor="let site of favoriteSites">
            <ion-label>
              <h2>{{ site.nombre }}</h2>
              <p>{{ site.ciudad?.nombre }}, {{ site.ciudad?.pais?.nombre }}</p>
            </ion-label>
            <ion-button slot="end" (click)="removeFavorite(site)">
              <ion-icon name="heart" color="danger"></ion-icon>
            </ion-button>
          </ion-item>
        </ion-item-group>

        <!-- Planificador de Ruta -->
        <ion-item-group>
          <ion-item-divider>
            <ion-label>Mi Ruta</ion-label>
          </ion-item-divider>
          
          <ion-reorder-group (ionItemReorder)="handleReorder($event)" disabled="false">
            <ion-item *ngFor="let site of routeSites">
              <ion-label>
                <h2>{{ site.nombre }}</h2>
                <p>{{ site.ciudad?.nombre }}</p>
              </ion-label>
              <ion-reorder slot="end"></ion-reorder>
            </ion-item>
          </ion-reorder-group>
        </ion-item-group>
      </ion-list>

      <!-- Botón para guardar ruta -->
      <ion-button expand="block" class="ion-margin" (click)="saveRoute()">
        Guardar Ruta
      </ion-button>
    </ion-content>
  `,
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule]
})
export class FavoritesPage implements OnInit {
  favoriteSites: any[] = [];
  routeSites: any[] = [];

  constructor() {
    this.loadFavorites();
  }

  ngOnInit() {
  }

  loadFavorites() {
    // Cargar favoritos desde localStorage
    const favorites = localStorage.getItem('favorites');
    if (favorites) {
      this.favoriteSites = JSON.parse(favorites);
    }

    // Cargar ruta planeada
    const route = localStorage.getItem('planned_route');
    if (route) {
      this.routeSites = JSON.parse(route);
    }
  }

  removeFavorite(site: any) {
    this.favoriteSites = this.favoriteSites.filter(s => s._id !== site._id);
    localStorage.setItem('favorites', JSON.stringify(this.favoriteSites));
  }

  handleReorder(event: any) {
    const itemMove = this.routeSites.splice(event.detail.from, 1)[0];
    this.routeSites.splice(event.detail.to, 0, itemMove);
    event.detail.complete();
  }

  saveRoute() {
    localStorage.setItem('planned_route', JSON.stringify(this.routeSites));
  }
}
