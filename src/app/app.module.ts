import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

//import { EditorModule } from '@tinymce/tinymce-angular';

import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { environment } from '../environments/environment';
import { HeaderComponent } from './core/component/header/header.component';
import { FooterComponent } from './core/component/footer/footer.component';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthService } from './services/auth.service';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { NotificationComponent } from './shared/components/notification/notification.component';

@NgModule({
  declarations: [AppComponent, HeaderComponent, FooterComponent, NotificationComponent],
  exports: [HeaderComponent, FooterComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireStorageModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    HttpClientModule

    //EditorModule
  ],
  providers: [
    AuthService, // Provide AuthService at the AppModule level
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
