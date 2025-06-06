import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SessionService } from './session.service';
import { UserService } from './user.service';
import { Session } from '../models/Session';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class SessionStoreService {
    private sessionsSubject: BehaviorSubject<Session[]> = new BehaviorSubject<Session[]>([]);
    public sessions$: Observable<Session[]> = this.sessionsSubject.asObservable();

    constructor(private sessionService: SessionService, private userService: UserService, private router: Router) { }

    getSessionsByUser(): void {
        const user = this.userService.getUserConnected()
        this.sessionService.getSessionsByUser(user.id).subscribe((response: Session[]) => {
            this.sessionsSubject.next(response);
        })
    }

    addNewSession(newSession: Session) {
        const currentSessions = this.sessionsSubject.value;
        const updatedSessions = [...currentSessions, newSession];
        this.sessionsSubject.next(updatedSessions);
    }

    deleteSession(sessionId: number): void {
        this.sessionService.deleteSession(sessionId).subscribe(() => {
            const currentSessions = this.sessionsSubject.value;
            const sessionIndex = currentSessions.findIndex(session => session.id === sessionId);

            if (sessionIndex > -1) {
                const updatedSessions = currentSessions.filter(session => session.id !== sessionId);
                this.sessionsSubject.next(updatedSessions);

                if (sessionIndex > 0) {
                    const previousSessionId = updatedSessions[sessionIndex - 1].id;
                    this.router.navigate([`dashboard/session/${previousSessionId}`]);
                } else if (updatedSessions.length > 0) {
                    this.router.navigate([`dashboard/session/${updatedSessions[0].id}`]);
                } else {
                    this.router.navigate(['dashboard/sessions']);
                }
            }
        });
    }

    updateSession(sessionUpdated: Session) {
        const currentSessions = this.sessionsSubject.value;
        const sessionIndex = currentSessions.findIndex(session => session.id === sessionUpdated.id);
        currentSessions.splice(sessionIndex, 1, sessionUpdated)
        this.sessionsSubject.next(currentSessions);

    }

}
