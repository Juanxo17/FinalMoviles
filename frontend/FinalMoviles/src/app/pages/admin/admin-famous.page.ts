import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, 
  IonSpinner, IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle, 
  IonCardContent, IonBackButton, IonButtons, AlertController, 
  ToastController, IonInput, IonFab, IonFabButton, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Famoso } from '../../interfaces/famoso.interface';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { addIcons } from 'ionicons';
import { add, arrowBack, people, create, trash } from 'ionicons/icons';

@Component({
  selector: 'app-admin-famous',
  template: `
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/tabs/tab4"></ion-back-button>
        </ion-buttons>
        <ion-title>Gestión de Famosos</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div *ngIf="loading" class="ion-text-center">
        <ion-spinner name="crescent"></ion-spinner>
        <p>Cargando personajes famosos...</p>
      </div>

      <div *ngIf="error" class="ion-padding ion-text-center">
        <ion-icon name="alert-circle-outline" size="large" color="danger"></ion-icon>
        <p>Error al cargar los personajes. Intenta de nuevo.</p>
        <ion-button (click)="loadFamosos()">Reintentar</ion-button>
      </div>

      <ion-card *ngIf="!loading && !error">
        <ion-card-header>
          <ion-card-title>
            <ion-icon name="people"></ion-icon>
            Lista de Personajes Famosos
          </ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <ion-list *ngIf="famosos.length > 0">
            <ion-item *ngFor="let famoso of famosos">              <ion-label>
                <h2>{{ famoso.nombre }}</h2>
                <p>Actividad: {{ famoso.actividadFama }}</p>
                <p>Ciudad: {{ getCiudadName(famoso.ciudadNacimiento) }}</p>
              </ion-label>
              <ion-button slot="end" (click)="editFamoso(famoso)">
                <ion-icon name="create"></ion-icon>
              </ion-button>
              <ion-button slot="end" color="danger" (click)="deleteFamoso(famoso._id!)">
                <ion-icon name="trash"></ion-icon>
              </ion-button>
            </ion-item>
          </ion-list>
          
          <div *ngIf="famosos.length === 0" class="ion-text-center">
            <p>No hay personajes famosos registrados</p>
          </div>
        </ion-card-content>
      </ion-card>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button (click)="addFamoso()">
          <ion-icon name="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `,
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel,
    IonSpinner, IonButton, IonIcon, IonCard, IonCardHeader, IonCardTitle,
    IonCardContent, IonBackButton, IonButtons, IonInput, IonFab, IonFabButton,
    IonSelect, IonSelectOption
  ]
})
export class AdminFamousPage implements OnInit {
  famosos: Famoso[] = [];
  loading = true;
  error = false;
  actividadesFama = ['Deportista', 'Actor', 'Político', 'Músico', 'Influencer', 'Otro'];

  constructor(
    private apiService: ApiService,
    private alertController: AlertController,
    private toastController: ToastController
  ) {
    addIcons({ add, arrowBack, people, create, trash });
  }

  ngOnInit() {
    this.loadFamosos();
  }

  loadFamosos() {
    this.loading = true;
    this.error = false;
    
    this.apiService.getFamosos().pipe(
      catchError(error => {
        console.error('Error loading famosos:', error);
        this.error = true;
        return of([]);
      })
    ).subscribe(famosos => {
      this.famosos = famosos;
      this.loading = false;
    });
  }

  async addFamoso() {
    const alert = await this.alertController.create({
      header: 'Nuevo Personaje Famoso',
      inputs: [
        {
          name: 'nombre',
          type: 'text',
          placeholder: 'Nombre'
        },
        {
          name: 'ciudadNacimiento',
          type: 'text',
          placeholder: 'Ciudad de Nacimiento (ID o Nombre)'
        },
        {
          name: 'actividadFama',
          type: 'text',
          placeholder: 'Actividad (Deportista, Actor, etc.)'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: (data) => {
            if (data.nombre && data.actividadFama) {
              this.apiService.createFamoso(data).subscribe({
                next: () => {
                  this.loadFamosos();
                  this.showToast('Personaje creado exitosamente');
                },
                error: (error) => {
                  console.error('Error creating famoso:', error);
                  this.showToast('Error al crear el personaje');
                }
              });
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async editFamoso(famoso: Famoso) {
    const alert = await this.alertController.create({
      header: 'Editar Personaje Famoso',
      inputs: [
        {
          name: 'nombre',
          type: 'text',
          value: famoso.nombre,
          placeholder: 'Nombre'
        },
        {
          name: 'ciudadNacimiento',
          type: 'text',
          value: typeof famoso.ciudadNacimiento === 'string' ? famoso.ciudadNacimiento : famoso.ciudadNacimiento._id,
          placeholder: 'Ciudad de Nacimiento (ID o Nombre)'
        },
        {
          name: 'actividadFama',
          type: 'text',
          value: famoso.actividadFama,
          placeholder: 'Actividad'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: (data) => {
            if (data.nombre && data.actividadFama) {
              this.apiService.updateFamoso(famoso._id!, data).subscribe({
                next: () => {
                  this.loadFamosos();
                  this.showToast('Personaje actualizado exitosamente');
                },
                error: (error) => {
                  console.error('Error updating famoso:', error);
                  this.showToast('Error al actualizar el personaje');
                }
              });
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async deleteFamoso(famosoId: string) {
    const alert = await this.alertController.create({
      header: '¿Eliminar personaje?',
      message: '¿Estás seguro de que deseas eliminar este personaje?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: () => {
            this.apiService.deleteFamoso(famosoId).subscribe({
              next: () => {
                this.loadFamosos();
                this.showToast('Personaje eliminado exitosamente');
              },
              error: (error) => {
                console.error('Error deleting famoso:', error);
                this.showToast('Error al eliminar el personaje');
              }
            });
          }
        }
      ]
    });

    await alert.present();
  }

  private async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom'
    });
    toast.present();
  }

  getCiudadName(ciudad: any): string {
    if (typeof ciudad === 'string') {
      return ciudad;
    } else if (ciudad && ciudad.nombre) {
      return ciudad.nombre;
    }
    return '';
  }
}
