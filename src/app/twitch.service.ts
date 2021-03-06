import { Injectable } from '@angular/core';
import { Http, Headers, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { TwitchUser } from './twitch-user';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import { TwitchDatabaseService } from './twitch-database.service';

@Injectable()
export class TwitchService {

  constructor(private http: Http, private dbService: TwitchDatabaseService) { }

  // getUsernames(): string[] {
  //   return [
  //     'SL_SC2',
  //     'OgamingSC2',
  //     'cretetion',
  //     'freecodecamp',
  //     'storbeck',
  //     'habathcx',
  //     'RobotCaleb',
  //     'noobs2ninjas',
  //     'MedryBW',
  //     'brunofin',
  //     'comster404'
  //   ];
  // }

  userNamesArray: string[] = [];

  getUserNames() {
    this.dbService.getUsers().then(userNames => this.userNamesArray = userNames);
  }

  printUserNames(){
    this.userNamesArray.forEach(name => console.log(name.toString()));
  }

  getUserIsOnline(un: string): Observable<boolean> {
    return this.http.get('https://api.twitch.tv/kraken/streams?channel=' + un, { headers: this.getHeaders() })
      .map(r => {
        let body = r.json();
        return body.streams.length > 0;
      })
      .catch(this.handleError);
  }

  getUser(un: string): Observable<TwitchUser> {
    return this.http.get('https://api.twitch.tv/kraken/channels/' + un, { headers: this.getHeaders() })
      .map(r => {
        let body = r.json();
        var user: TwitchUser = {
          name: un,
          displayName: body.display_name,
          status: body.status,
          logo: body.logo,
          isOnline: false,
          url: body.url
        };
        return user;
      })

      .catch((error: any) => {
        let err = error.json();
        var errObject = {
          userName: un,
          errMsg: err.message,
          errStatus: err.status
        };
        return Observable.throw(errObject);
      }
      )
  }

  private getHeaders() {
    let headers = new Headers();
    headers.append('Client-Id', 'tp5gjgy7gtcy5w4u4pjdb8bw4uz3o5b');
    return headers;
  }
  private extractData(res: Response) {
    let body = res.json();
    return body || {};
  }
  private handleError(error: Response | any) {
    // In a real world app, we might use a remote logging infrastructure
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error(errMsg);
    return Observable.throw(errMsg);
  }
}
