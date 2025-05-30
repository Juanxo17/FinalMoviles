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
import { catchError, forkJoin } from 'rxjs';
import { of } from 'rxjs';
import { addIcons } from 'ionicons';
import { bookmark, people, calendar, location, time } from 'ionicons/icons';

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
  visitas: Visita[] = [];
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
        this.visitas = visitas;
        this.tags = tags;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error al cargar datos:', error);
        this.error = true;
        this.loading = false;
      }
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
