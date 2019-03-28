import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { retry, map } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';



@Injectable({
	providedIn: 'root'
})

export class AuthService {
	constructor(private http : HttpClient) {}

	readonly url : string = '';//environment.API_URL + "/api/v1";

	public login(email:string, password:string) : Observable<string> {
		return this.http.post<any>(this.url + `/authenticate`, { email:email, password:password })
			.pipe(retry(3), map((response) => {
				if(response.success) {
					localStorage.setItem('auth', JSON.stringify({ token: response.token }));

					return response.token as string;
				} else {
					throw new Error(response.message);
				}
			}))
	}

	public isAuthenticated() : boolean {
		let auth = JSON.parse(localStorage.getItem('auth'));
		if(!auth) return false;
		
		let token = auth.token; // your token

		const helper = new JwtHelperService();

		if(!token || helper.isTokenExpired(token)) {
			//this._store.dispatch(new Logout());
			return false;
		} 
		return true;
	}
}