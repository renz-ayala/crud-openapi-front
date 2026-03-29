import { importProvidersFrom, NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule } from '@angular/forms';
import { ApiModule, Configuration } from './api';
import { environment } from '../environments/environment';
import { provideHttpClient } from '@angular/common/http'
import { AppComponent } from './app.component';
import {NzIconDirective, NzIconModule} from 'ng-zorro-antd/icon';
import { CarOutline, SearchOutline, DownloadOutline, PrinterOutline,
  ReloadOutline, DatabaseOutline } from '@ant-design/icons-angular/icons';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { Captcha } from './pages/captcha/captcha';

const icons = [ CarOutline, SearchOutline, DownloadOutline, PrinterOutline,
  ReloadOutline, DatabaseOutline ];

export function apiConfig() {
  return new Configuration({
    basePath: environment.apiUrl
  });
}

@NgModule({
  declarations: [
    AppComponent
  ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        FormsModule,
        ApiModule.forRoot(apiConfig),
        Captcha,
        NzIconDirective
    ],
  providers: [
    provideHttpClient(),
    provideAnimationsAsync(),
    provideBrowserGlobalErrorListeners(),
    importProvidersFrom(NzIconModule.forRoot(icons)),
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
