import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Credentials } from '../user/credentials.model';
import { environment } from '../../environments/environment';
import { retry, map } from 'rxjs/operators';
import { UtilsService } from '../utils/utils.service';


@Injectable({
	providedIn: 'root'
})

export class AuthService {
	constructor(private http 	: HttpClient,
				private _utils	: UtilsService) {}

	readonly url : string = environment.API_URL + "/api/v1";

	public login(credentials: Credentials) : Observable<string> {
		//use spread to get individual properties off the supplied user object
		//to a new object
		return this.http.post<any>(this.url + `/authenticate`, { ...credentials })
			.pipe(retry(3), map((response) => {
				if(response.success) {
					return response.token as string;
				} else {
					this._utils.error('Wrong login or password');
					throw new Error(response.message);
				}
			}))
	}
}
