import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, retry, map, shareReplay, retryWhen, tap, delayWhen } from 'rxjs/operators';
import { environment } from './../../environments/environment';


@Injectable()
export class DataService {
    readonly url : string = environment.API_URL + "/api/v1/datapoints";

	constructor(private _http: HttpClient) {}

    public getDatapoints() {
        return this._http.get<any>(this.url + '/')
		.pipe(retry(3), map((response) => {
			if(response.success) {
				return Object.values(response.result);
			} else {
				throw new Error(response.message);
			}
		}));	
	}

	public create(datapoint: any) {
        datapoint.orderOfBowls = JSON.stringify(datapoint.orderOfBowls);
        datapoint.bowlsVisitedOrder = JSON.stringify(datapoint.bowlsVisitedOrder);

		return this._http.post<any>(this.url + '/', { data: datapoint })
		.pipe(retry(3), map((response) => {
			if(response.success) {
				return response.result;
			} else {
				throw new Error(response.message);
			}
		}))
	}

	public update(datapoint: any) {
        datapoint.orderOfBowls = JSON.stringify(datapoint.orderOfBowls);
        datapoint.bowlsVisitedOrder = JSON.stringify(datapoint.bowlsVisitedOrder);

		return this._http.put<any>(this.url + '/', { data: datapoint })
		.pipe(retry(3), map((response) => {
			if(response.success) {
				return response.result;
			} else {
				throw new Error(response.message);
			}
		}))
	}


}