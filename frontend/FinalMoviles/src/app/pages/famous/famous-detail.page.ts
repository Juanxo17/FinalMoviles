import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, 
  IonSkeletonText, IonSpinner, IonButton, IonIcon, IonCard, IonCardHeader, 
  IonCardTitle, IonCardContent, IonBackButton, IonButtons, IonGrid, IonRow, IonCol,
  IonCardSubtitle } from '@ionic/angular/standalone';
import { ApiService} from '../../services/api.service';
import { Famoso } from 'src/app/interfaces/famoso.interface';
import { catchError } from 'rxjs';
import { of } from 'rxjs';
import { addIcons } from 'ionicons';
import { people, arrowBack, business } from 'ionicons/icons';

@Component({
  selector: 'app-famous-detail',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/tabs/tab2"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ famoso?.nombre || 'Personaje Famoso' }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div *ngIf="loading" class="ion-padding ion-text-center">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Cargando información...</p>
      </div>

      <div *ngIf="error" class="ion-padding ion-text-center">
        <ion-icon name="alert-circle-outline" size="large" color="danger"></ion-icon>
        <p>Error al cargar la información. Intenta de nuevo.</p>
        <ion-button (click)="loadData()">Reintentar</ion-button>
      </div>

      <div *ngIf="!loading && !error && famoso">
        <ion-card>
          <ion-card-header>
            <ion-card-title>{{ famoso.nombre }}</ion-card-title>
            <ion-card-subtitle *ngIf="famoso.actividadFama">{{ famoso.actividadFama }}</ion-card-subtitle>
          </ion-card-header>          <ion-card-content>
            <p>Personaje famoso de {{ ciudadNombre }}</p>

            <div class="ion-padding-top">
              <ion-item lines="none">
                <ion-icon name="business" slot="start"></ion-icon>
                <ion-label>
                  <h3>Ciudad de Nacimiento</h3>
                  <p>{{ ciudadNombre }}</p>
                </ion-label>
              </ion-item>
            </div>
          </ion-card-content>
        </ion-card>
      </div>
    </ion-content>
  `,
  styles: [`
    ion-content {
      --padding-top: 16px;
      --padding-bottom: 16px;
      --padding-start: 16px;
      --padding-end: 16px;
    }
    ion-card {
      margin-bottom: 16px;
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonSkeletonText,
    IonSpinner,
    IonButton,
    IonIcon,    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonBackButton,
    IonButtons,
    IonGrid,
    IonRow,
    IonCol
  ]
})
export class FamousDetailPage implements OnInit {
  famosoId: string = '';
  famoso: Famoso | null = null;
  ciudadNombre: string = '';
  loading: boolean = true;
  error: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService
  ) {
    addIcons({ people, arrowBack, business });
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.famosoId = id;
        this.loadData();
      } else {
        this.router.navigate(['/tabs/tab2']);
      }
    });
  }

  loadData() {
    this.loading = true;
    this.error = false;

    this.apiService.getFamosoById(this.famosoId).pipe(
      catchError(error => {
        console.error('Error al cargar famoso:', error);
        this.error = true;
        this.loading = false;
        return of(null);
      })
    ).subscribe(famoso => {
      if (famoso) {
        this.famoso = famoso;
          // Get ciudad name if available
        if (typeof famoso.ciudadNacimiento === 'object' && famoso.ciudadNacimiento) {
          this.ciudadNombre = famoso.ciudadNacimiento.nombre;
        } else if (typeof famoso.ciudadNacimiento === 'string') {
          this.apiService.getCiudadById(famoso.ciudadNacimiento).subscribe(ciudad => {
            if (ciudad) {
              this.ciudadNombre = ciudad.nombre;
            }
          });
        }

        this.loading = false;
      } else {
        this.loading = false;
      }
    });
  }
}
