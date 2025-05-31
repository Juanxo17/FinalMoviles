import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, 
  IonSkeletonText, IonSpinner, IonButton, IonIcon, IonCard, IonCardHeader, 
  IonCardTitle, IonCardContent, IonBackButton, IonButtons, IonBadge, IonSegment, 
  IonSegmentButton, IonRefresher, IonRefresherContent } from '@ionic/angular/standalone';
import { ApiService, Visita, Tag } from '../services/api.service';
import { AuthStateService } from '../services/auth-state.service';
import { catchError, forkJoin, of } from 'rxjs';
import { addIcons } from 'ionicons';
import { bookmark, people, calendar, location, time } from 'ionicons/icons';
import { map } from 'rxjs/operators';

interface VisitaWithLocation extends Visita {
  locationName?: string;
}

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
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
    IonIcon, 
    IonCard, 
    IonCardHeader, 
    IonCardTitle, 
    IonCardContent, 
    IonBackButton, 
    IonButtons, 
    IonBadge,
    IonSegment,
    IonSegmentButton,
    IonRefresher,
    IonRefresherContent
  ],
})
export class Tab3Page implements OnInit {
  segment: 'visitas' | 'tags' = 'visitas';
  visitas: VisitaWithLocation[] = [];
  tags: Tag[] = [];
  loading: boolean = true;
  error: boolean = false;
  
  constructor(
    private apiService: ApiService,
    private authStateService: AuthStateService
  ) {
    addIcons({ bookmark, people, calendar, location, time });
  }
  
  ngOnInit() {
    this.loadData();
  }
  
  segmentChanged(ev: any) {
    this.segment = ev.detail.value;
  }
  
  loadData() {
    this.loading = true;
    this.error = false;
    
    const visitas$ = this.apiService.getVisitas().pipe(
      catchError(error => {
        console.error('Error al cargar visitas:', error);
        return of([]);
      })
    );
    
    const tags$ = this.apiService.getTags().pipe(
      catchError(error => {
        console.error('Error al cargar tags:', error);
        return of([]);
      })
    );
    
    forkJoin([visitas$, tags$]).subscribe({
      next: ([visitas, tags]) => {
        this.visitas = visitas as VisitaWithLocation[];
        this.tags = tags;
        this.loadVisitas();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar datos:', error);
        this.error = true;
        this.loading = false;
      }
    });
  }
  
  loadVisitas() {
    this.apiService.getVisitas().subscribe(visitas => {
      this.visitas = visitas;
      
      this.visitas.forEach(visita => {
        if (visita.ubicacion?.coordinates && 
            visita.ubicacion.coordinates.length >= 2) {
          const [lon, lat] = visita.ubicacion.coordinates;
          if (typeof lat === 'number' && typeof lon === 'number') {
            this.apiService.getLocationInfo(lat, lon)
              .pipe(
                catchError(error => {
                  console.error('Error fetching location:', error);
                  return of({ display_name: '', address: {} });
                })
              )
              .subscribe(location => {
                if ('address' in location && location.address) {
                  const address = location.address;
                  const city = 'city' in address ? address.city : 
                              'town' in address ? address.town : '';
                  const state = 'state' in address ? address.state : '';
                  const country = 'country' in address ? address.country : '';
                
                  visita.locationName = [city, state, country]
                    .filter(part => part)
                    .join(', ') || 'Ubicación no disponible';
                } else {
                  visita.locationName = 'Ubicación no disponible';
                }
              });
          }
        }
      });
    });
  }

  handleRefresh(event: any) {
    this.loadData();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }

  getSitioId(sitio: any): string {
    if (!sitio) return '';
    
    if (typeof sitio === 'string') {
      return sitio;
    } else if (sitio && '_id' in sitio) {
      return sitio._id;
    }
    
    return '';
  }

  getSitioNombre(sitio: any): string {
    if (!sitio) return 'Sitio';
    
    if (typeof sitio === 'string') {
      return 'Sitio';
    } else if (sitio && 'nombre' in sitio) {
      return sitio.nombre;
    }
    
    return 'Sitio';
  }
}
