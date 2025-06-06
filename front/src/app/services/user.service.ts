import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000/api/users';

  constructor(private http: HttpClient) { }

  login(formdata: any): Observable<any> {
    const mail = formdata.mail
    const password = formdata.password
    return this.http.post<any>(`${this.apiUrl}/login`, { mail, password });
  }

  signin(formdata: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/create`, formdata);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }

  resetPassword(formdata: any): Observable<any> {
    const userConnected = localStorage.getItem('user');
    const mail = userConnected ? JSON.parse(userConnected).mail : ''
    const idUser = userConnected ? JSON.parse(userConnected).id : ''
    const oldPassword = formdata.oldPassword
    const newPassword = formdata.newPassword
    return this.http.post<any>(`${this.apiUrl}/resetpassword`, { idUser, mail, oldPassword, newPassword });
  }

  clearUserData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getUserConnected() {
    const userConnected = localStorage.getItem('user');
    if (userConnected) {
      return JSON.parse(userConnected)
    }
  }

  sendMailResetPassword(email: string) {
    return this.http.post(`${this.apiUrl}/send-mail-reset-password`, { email });
  }
}
