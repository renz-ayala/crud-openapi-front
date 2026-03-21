import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ConsultarPlacaComponent } from './pages/consultar-placa/consultar-placa.component';

import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ApiModule, Configuration } from './api';
import { environment } from '../environments/environment';

export function apiConfig() {
  return new Configuration({
    basePath: environment.apiUrl
  });
}

@NgModule({
  declarations: [
    AppComponent,
    ConsultarPlacaComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
     FormsModule,
    HttpClientModule,
    ApiModule.forRoot(apiConfig)
  ],
  providers: [
    provideBrowserGlobalErrorListeners()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
