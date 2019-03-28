import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { TopNavComponent } from './top-nav/top-nav.component';
import { SideNavComponent } from './side-nav/side-nav.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatFormFieldModule, 
  MatCardModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatInputModule,
  MatSelectModule } from '@angular/material';
  import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
  import { TokenInterceptorService as TokenInterceptor } from './services/token-interceptor.service';
  import { AuthService } from './services/auth.service';
  import { DataService } from './services/data.service';




@NgModule({
  declarations: [
    AppComponent,
    TopNavComponent,
    SideNavComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatCardModule,
    MatNativeDateModule,
    MatInputModule,
    MatSelectModule,
  ],
  providers: [    
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
    AuthService,
    DataService,
],
  bootstrap: [AppComponent]
})
export class AppModule { }
