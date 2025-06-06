import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Session } from '../models/Session';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  private apiUrl = 'http://localhost:3000/api/session';

  constructor(private http: HttpClient) { }

  addSession(formdata: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/add`, formdata).pipe(
      map(response => {
        if (response.date) {
          response.date = new Date(response.date)
        }
        return response;
      })
    );
  }

  getSessionsByUser(userId: number): Observable<Session[]> {
    return this.http.post<Session[]>(`${this.apiUrl}/`, { userId }).pipe(
      map((sessions: Session[]) => sessions.map((session: Session) => ({
        ...session,
        date: new Date(session.date),
      })))
    );
  }

  deleteSession(sessionId: number): Observable<Session[]> {
    return this.http.delete<Session[]>(`${this.apiUrl}/delete/${sessionId}`)
  }

  getSessionById(sessionId: number): Observable<Session> {
    return this.http.get<Session>(`${this.apiUrl}/${sessionId}`);
  }

  updateSession(session: Session): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/update`, session);
  }


}
