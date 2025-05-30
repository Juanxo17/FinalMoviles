import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonList, IonButton, IonCard, IonCardHeader, IonCardTitle, IonCardContent } from '@ionic/angular/standalone';
import { AuthStateService } from '../services/auth-state.service';
import { User } from '../interfaces/user.interface';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,  imports: [
    CommonModule,
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonContent, 
    IonItem, 
    IonLabel, 
    IonList, 
    IonButton, 
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent
  ],
})
export class Tab1Page implements OnInit {
  currentUser: User | null = null;

  constructor(private authStateService: AuthStateService) {}

  ngOnInit() {
    this.authStateService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
  }

  logout() {
    this.authStateService.logout();
  }
}
