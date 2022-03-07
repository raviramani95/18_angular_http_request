import { HttpClient, HttpEventType, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Post } from './post.model';

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  error = new Subject<string>();
  url = 'https://ng-complete-guide-55795-default-rtdb.firebaseio.com/';

  constructor(private http: HttpClient) { }

  CreateAndStorePost(title: string, content: string){
    const postData: Post = {title: title, content: content};

    this.http.post<{ name: string }>(this.url + 'posts.json', postData, 
      {
        observe: 'response',
        responseType: 'json'
      })
      .subscribe(responseData => {
        console.log(responseData);
      }, error => {
        this.error.next(error.message);
      });
  }

  fetchPosts(){
    let searchParams = new HttpParams();
    searchParams = searchParams.append('print', 'pretty');
    searchParams = searchParams.append('custom', 'key');

    return this.http.get<{ [key: string]: Post}>(this.url + 'posts.json', 
      {
        headers: new HttpHeaders({ 'Custom-Header': "hello"}),
        params: searchParams,
        responseType: 'json'
      })
      .pipe(
        map(responseData => {
          const postsArray: Post[] = [];
          for(const key in responseData){
            if(responseData.hasOwnProperty(key)){
              postsArray.push({...responseData[key], id: key});
            } 
          }
          return postsArray;
        }),
        catchError(errorRes => {
          return throwError(errorRes);
        })
      );
  }

  deletePosts(){
    return this.http.delete(this.url + 'posts.json', {
      observe: 'events'
    })
    .pipe(tap(event => {
      console.log(event);
      if(event.type === HttpEventType.Sent){
        // /..
      }
      if(event.type === HttpEventType.Response){
        console.log(event.body);
      }
    })
    );
  }
}
