import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User, LoginCredentials, RegisterCredentials, AuthResponse } from '../interfaces/user.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private userSubject = new BehaviorSubject<User | null>(null);
  private tokenKey = 'auth_token';
  private userKey = 'user_data';

  constructor(private http: HttpClient) { 
    this.loadStoredUser();
  }

  // Cargar usuario almacenado en localStorage al iniciar
  private loadStoredUser(): void {
    const storedToken = localStorage.getItem(this.tokenKey);
    const storedUser = localStorage.getItem(this.userKey);
    
    if (storedToken && storedUser) {
      this.userSubject.next(JSON.parse(storedUser));
    }
  }

  // Obtener el usuario actual
  get currentUser(): Observable<User | null> {
    return this.userSubject.asObservable();
  }

  // Obtener el token actual
  get token(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Verificar si el usuario está autenticado
  get isAuthenticated(): boolean {
    return !!this.token;
  }
  // Registro de usuario
  register(credentials: RegisterCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, credentials)
      .pipe(
        tap(response => {
          if (response.token) {
            // Si el backend devuelve un usuario, usarlo, sino crear uno con los datos del registro
            const user: User = response.user || {
              _id: response.id,
              nombre: credentials.nombre,
              email: credentials.email,
              rol: 'USUARIO' // Valor por defecto según el modelo
            };
            this.storeUserData(response.token, user);
          }
        })
      );
  }
  // Login de usuario
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          if (response.token) {
            // Primero almacenar el token
            localStorage.setItem(this.tokenKey, response.token);
            
            // Crear un objeto de usuario básico con la información que tenemos
            const basicUser: User = {
              _id: response.id,
              nombre: 'Usuario',  // Placeholder hasta que obtengamos los datos completos
              email: credentials.email
            };
            
            // Guardar datos básicos para que la app funcione mientras se carga el usuario completo
            this.userSubject.next(basicUser);
            localStorage.setItem(this.userKey, JSON.stringify(basicUser));
            
            // No intentar obtener el usuario completo aquí, ya que puede fallar
            // La app utilizará los datos básicos inicialmente
          }
        })
      );
  }
  
  // Obtener usuario por ID
  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/getUser/${id}`);
  }

  // Cerrar sesión
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.userSubject.next(null);
  }

  // Almacenar datos del usuario y token
  private storeUserData(token: string, user: User): void {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.userSubject.next(user);
  }
}
