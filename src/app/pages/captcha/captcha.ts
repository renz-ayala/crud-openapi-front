import {afterNextRender, Component, ElementRef, inject, NgZone, output, signal, viewChild} from '@angular/core';
import {environment} from '../../../environments/environment';
import {NzIconDirective} from 'ng-zorro-antd/icon';

declare global {
  interface Window {
    turnstile: Turnstile;
  }
}

@Component({
  selector: 'app-captcha',
  standalone: true,
  imports: [
    NzIconDirective
  ],
  templateUrl: './captcha.html'
})
export class Captcha{

  tokenSolve = output<string>();
  private readonly captchaContainer = viewChild.required<ElementRef<HTMLDivElement>>('captchaContainer');
  private readonly widgetId = signal<string | null>(null);
  private readonly siteKey = signal(environment.siteKey);

  private readonly zone = inject(NgZone);

  constructor() {
    afterNextRender( () => {
      this.initTurnstile();
    })
  }

  private async initTurnstile() {
    await this.loadTurnstileScript();

    const container= this.captchaContainer().nativeElement;
    const id = window.turnstile.render(container, {
      sitekey: this.siteKey(),
      theme: 'light',
      callback: (token: string) => {
        this.zone.run(() => this.tokenSolve.emit(token));
      }
    });

    this.widgetId.set(id);
  }

  private loadTurnstileScript(): Promise<void>{
    return new Promise( (resolve) => {
      if(window.turnstile) return resolve();

      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      document.body.appendChild(script);
    })
  }

  public refreshCaptcha(){
    const id = this.widgetId();
    if(window.turnstile && id){
      window.turnstile.reset(id);
    }
  }

  // ngOnInit() {
  //   this.loadTurnstileScript().then( () => {
  //     this.widgetId.set(window.turnstile.render(this.captchaContainer()?.nativeElement , {
  //       siteKey: this.siteKey(),
  //       theme: 'light',
  //       callback: (token: string) => {
  //         this.zone.run(() => this.tokenSolve.emit(token) )
  //       }
  //     }))
  //   })
  // }

  // ngOnChanges() {
  //   if(window.turnstile && this.widgetId() != null){
  //     window.turnstile.remove(this.widgetId());
  //   }
  // }
}
