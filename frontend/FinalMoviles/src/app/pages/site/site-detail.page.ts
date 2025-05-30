import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, 
  IonSkeletonText, IonSpinner, IonButton, IonIcon, IonCard, IonCardHeader, 
  IonCardTitle, IonCardContent, IonBackButton, IonButtons, IonGrid, IonRow, IonCol,
  IonChip, IonBadge, IonToast, ToastController, AlertController, IonCardSubtitle } from '@ionic/angular/standalone';
import { ApiService, Sitio, Tag } from '../../services/api.service';
import { Plato } from 'src/app/interfaces/plato.interface';
import { AuthStateService } from '../../services/auth-state.service';
import { catchError, forkJoin, switchMap } from 'rxjs';
import { of } from 'rxjs';
import { addIcons } from 'ionicons';
import { location, restaurant, arrowBack, bookmark, star, starOutline, people } from 'ionicons/icons';

@Component({
  selector: 'app-site-detail',
  templateUrl: './site-detail.page.html',
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
    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 10px;
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
    IonCol,
    IonChip,
    IonBadge,
    IonToast
  ]
})
export class SiteDetailPage implements OnInit {
  sitioId: string = '';
  sitio: Sitio | null = null;
  ciudadNombre: string = '';
  platos: Plato[] = [];
  tags: Tag[] = [];
  loading: boolean = true;
  error: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private authStateService: AuthStateService,
    private toastController: ToastController,
    private alertController: AlertController
  ) {
    addIcons({ location, restaurant, arrowBack, bookmark, star, starOutline, people });
  }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.sitioId = id;
        this.loadData();
      } else {
        this.router.navigate(['/tabs/tab2']);
      }
    });
  }

  loadData() {
    this.loading = true;
    this.error = false;

    this.apiService.getSitioById(this.sitioId).pipe(
      catchError(error => {
        console.error('Error al cargar sitio:', error);
        this.error = true;
        this.loading = false;
        return of(null);
      })
    ).subscribe(sitio => {
      if (sitio) {
        this.sitio = sitio;
        
        // Get ciudad name if available
        if (typeof sitio.ciudad === 'object' && sitio.ciudad) {
          this.ciudadNombre = sitio.ciudad.nombre;
        } else if (typeof sitio.ciudad === 'string') {
          this.apiService.getCiudadById(sitio.ciudad).subscribe(ciudad => {
            if (ciudad) {
              this.ciudadNombre = ciudad.nombre;
            }
          });
        }

        // Load related data
        const platos$ = this.apiService.getPlatos().pipe(
          catchError(error => {
            console.error('Error al cargar platos:', error);
            return of([]);
          })
        );

        const tags$ = this.apiService.getTags().pipe(
          catchError(error => {
            console.error('Error al cargar tags:', error);
            return of([]);
          })
        );        forkJoin([platos$, tags$]).subscribe(([platos, tags]) => {
          // Filter platos by sitio
          this.platos = platos.filter(plato => {
            if (!plato.sitio) return false;
            
            if (typeof plato.sitio === 'string') {
              return plato.sitio === this.sitioId;
            } else {
              return plato.sitio._id ? plato.sitio._id === this.sitioId : false;
            }
          });

          // Filter tags by sitio
          this.tags = tags.filter(tag => {
            if (!tag.sitio) return false;
            
            if (typeof tag.sitio === 'string') {
              return tag.sitio === this.sitioId;
            } else {
              return tag.sitio._id ? tag.sitio._id === this.sitioId : false;
            }
          });

          this.loading = false;
        });
      } else {
        this.loading = false;
      }
    });
  }

  async registrarVisita() {
    if (!this.sitioId) {
      return;
    }

    try {
      const visita = await this.apiService.createVisita(this.sitioId).toPromise();
      const toast = await this.toastController.create({
        message: 'Visita registrada correctamente',
        duration: 2000,
        position: 'top',
        color: 'success'
      });
      await toast.present();
    } catch (error) {
      console.error('Error al registrar visita:', error);
      const toast = await this.toastController.create({
        message: 'Error al registrar la visita',
        duration: 2000,
        position: 'top',
        color: 'danger'
      });
      await toast.present();
    }
  }

  async crearTag() {
    if (!this.sitioId) {
      return;
    }

    const alert = await this.alertController.create({
      header: 'Registrar Encuentro',
      inputs: [
        {
          name: 'nombre',
          type: 'text',
          placeholder: 'Nombre del encuentro'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Registrar',
          handler: async (data) => {
            if (!data.nombre) {
              const toast = await this.toastController.create({
                message: 'Por favor ingresa un nombre para el encuentro',
                duration: 2000,
                position: 'top',
                color: 'warning'
              });
              await toast.present();
              return;
            }

            try {
              // In a real application, we would fetch the current geolocation
              // and show a list of personajes to select
              const geo = { lat: 0, lng: 0 };
              const tag = await this.apiService.createTag({
                nombre: data.nombre,
                personajes: [], // This would be populated with selected personajes
                sitioId: this.sitioId,
                geo
              }).toPromise();

              this.tags.push(tag as Tag);

              const toast = await this.toastController.create({
                message: 'Encuentro registrado correctamente',
                duration: 2000,
                position: 'top',
                color: 'success'
              });
              await toast.present();
            } catch (error) {
              console.error('Error al registrar encuentro:', error);
              const toast = await this.toastController.create({
                message: 'Error al registrar el encuentro',
                duration: 2000,
                position: 'top',
                color: 'danger'
              });
              await toast.present();
            }
          }
        }
      ]
    });

    await alert.present();
  }
}
