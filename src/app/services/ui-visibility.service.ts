import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UiVisibilityService {
  private visibleSubject = new BehaviorSubject<boolean>(true);
  visibility$ = this.visibleSubject.asObservable();

  show() {
    this.visibleSubject.next(true);
  }

  hide() {
    this.visibleSubject.next(false);
  }

  set(visible: boolean) {
    this.visibleSubject.next(visible);
  }
}
