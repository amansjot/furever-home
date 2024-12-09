import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProfilePicService {
  private profilePicSubject = new BehaviorSubject<string>(
    localStorage.getItem('profilePic') || 'https://i.imgur.com/AZFfFIy.png'
  );
  profilePic$ = this.profilePicSubject.asObservable();

  updateProfilePic(newUrl: string): void {
    localStorage.setItem('profilePic', newUrl);
    this.profilePicSubject.next(newUrl);
  }
}
