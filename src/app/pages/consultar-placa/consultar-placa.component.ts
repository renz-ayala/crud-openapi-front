import {Component, computed, effect, ElementRef, inject, signal, viewChild} from '@angular/core';
import { PlacaControllerService, PlacaRequest, PlacaResponse } from '../../api';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, finalize, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTableModule } from 'ng-zorro-antd/table';
import { Descarga } from '../../services/descarga';
import {Captcha} from '../captcha/captcha';

@Component({
  selector: 'app-consultar-placa',
  standalone: true,
  imports: [ReactiveFormsModule,
    NzButtonModule,
    NzInputModule,
    NzFormModule,
    NzIconModule,
    NzTableModule,
    Captcha
  ],
  templateUrl: './consultar-placa.component.html',
  styleUrls: ['./consultar-placa.component.scss']
})
export class ConsultarPlacaComponent{

  private readonly replaqueoService = inject(PlacaControllerService);
  private readonly fb = inject(FormBuilder);
  private readonly downloadService = inject(Descarga);

  tableToPrint = viewChild<ElementRef<HTMLElement>>('tableToPrint');
  resultado = signal('');
  error = signal(false);
  tokenCaptcha = signal('');
  tableData = signal<PlacaResponse | null>(null);
  isSpinning = signal(false);
  downloading = signal(false);

  textoBoton = computed(() => this.isSpinning() ? 'Buscando...' : 'Realizar Búsqueda');
  cssResultado = computed(() =>
    this.error()
      ? 'tw-p-5 tw-rounded-2xl tw-bg-red-50 tw-border tw-border-red-100 tw-text-red-600 tw-text-center tw-animate-shake'
      : 'tw-p-5 tw-rounded-2xl tw-bg-emerald-50 tw-border tw-border-emerald-100 tw-text-emerald-700 tw-text-center tw-shadow-sm'
  );

  form = this.fb.group({
    placa: ['', [Validators.required, Validators.pattern('^[A-Z0-9Ñ]{6,7}$')]]
  });

  constructor() {
    effect(() => {
      if (this.tableToPrint()) {
        this.redirectView(this.tableToPrint()?.nativeElement);
      }
    });
  }

  consultar() {

    if(this.form.invalid){
      this.resultado.set('Por favor, ingrese un formato de placa válido.');
      this.error.set(true);
      return;
    }

    this.resetForm();
    this.isSpinning.set(true);

    const request: PlacaRequest = {
      numPlaca: this.form.controls.placa.value?.trim().toUpperCase(),
      idTransaction: this.tokenCaptcha()
    }

    this.replaqueoService.verificar(request).pipe(
      finalize( () => this.isSpinning.set(false)),
      catchError((e: HttpErrorResponse) => {
        let mensajeError = 'Error inesperado';
        if (e.status === 0) {
          mensajeError = 'El servidor no responde';
        } else {
          mensajeError = e.error?.response ?? `Error del servidor: ${e.status}`;
        }
        return throwError(() => new Error(mensajeError) );
      })
    ).subscribe({
        next:(respuesta: PlacaResponse) =>{
          this.resultado.set(respuesta.response ? respuesta.response : 'Sin resultado')
          this.tableData.set(respuesta);
          const statusOk = (respuesta.status as string) === 'OK';
          this.error.set(!statusOk);
        },
        error: (e: Error) => {
          console.error(e);
          this.error.set(true);
          this.resultado.set(e.message);
        }
      }
    )

  }

  downloadWithMs(){
    if(!this.tableData()){
      return;
    }

    this.downloading.set(true);

    const downloadReq : PlacaRequest = {
      numPlaca: this.tableData()?.numPlaca
    }

    this.replaqueoService.getReporte(downloadReq).pipe(
      finalize( () => this.downloading.set(false))
    ).subscribe({
      next: ( response: any ) => {
        const blob = new Blob([response], { type: 'application/pdf' });
        this.downloadService.downloadBlob(blob, downloadReq.numPlaca ?? 'undefined', '.pdf')
      }, error: (e) => console.error(e)
    });
  }

  downloadWithNg(){
    if (this.tableToPrint()) {
      this.downloadService.printReport(this.tableToPrint()?.nativeElement);
    } else {
      console.warn('La tabla aún no está lista para imprimir');
    }
  }

  filtrarInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const valorFiltrado = input.value.toUpperCase().replaceAll(/[^A-Z0-9Ñ]/g, '');

    this.form.controls.placa.setValue(valorFiltrado, { emitEvent: false} );

    if(!valorFiltrado) this.resetForm();
  }

  private resetForm() {
    this.resultado.set('');
    this.tableData.set(null);
    this.error.set(false);
  }

  getSolvedCaptcha(token: string){
    this.tokenCaptcha.set(token);
  }

  redirectView(element : HTMLElement | undefined){
    setTimeout( () => {
      if(element){
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 0);
  }

}
