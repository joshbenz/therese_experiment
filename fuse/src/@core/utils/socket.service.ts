import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import io from "socket.io-client";
import { environment } from '../../environments/environment';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';



@Injectable({
	providedIn: 'root'
})

export class SocketService {

    //private socket;
    constructor(private _store: Store) {}

    connect() : any {
        let socket = io.connect(environment.SOCKET_URL);
        return socket;
    }

    getSocket() : any {
        let observable = new Observable(observer => {
            let socket = this.connect();
            socket.on('Data Sync', (data) => {
              observer.next(data);    
            });
          })     
          return observable;
        } 
}