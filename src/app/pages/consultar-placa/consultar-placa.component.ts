import { Component, computed, inject, signal } from '@angular/core';
import { PlacaControllerService, PlacaRequest, PlacaResponse } from '../../api';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, finalize, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { NzButtonModule } from 'ng-zorro-antd/button'; 
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTableModule } from 'ng-zorro-antd/table';

@Component({
  selector: 'app-consultar-placa',
  standalone: true,
  imports: [ReactiveFormsModule,
    NzButtonModule,
    NzInputModule,
    NzFormModule,
    NzIconModule,
    NzTableModule
  ],
  templateUrl: './consultar-placa.component.html',
  styleUrls: ['./consultar-placa.component.scss']
})
export class ConsultarPlacaComponent{

  private readonly replaqueoService = inject(PlacaControllerService);
  private readonly fb = inject(FormBuilder);

  resultado = signal('');
  error = signal(false);
  isSpinning = signal(false);
  tableData = signal<PlacaResponse | null>(null);
  
  textoBoton = computed(() => this.isSpinning() ? 'Buscando...' : 'Realizar Búsqueda');
  cssResultado = computed(() => 
    this.error() 
      ? 'tw-p-5 tw-rounded-2xl tw-bg-red-50 tw-border tw-border-red-100 tw-text-red-600 tw-text-center tw-animate-shake' 
      : 'tw-p-5 tw-rounded-2xl tw-bg-emerald-50 tw-border tw-border-emerald-100 tw-text-emerald-700 tw-text-center tw-shadow-sm'
  );

  form = this.fb.group({
    placa: ['', [Validators.required, Validators.pattern('^[A-Z0-9Ñ]{6,7}$')]]
  });

  consultar() {

    if(this.form.invalid){
      this.resultado.set('Por favor, ingrese un formato de placa válido.');
      this.error.set(true);
      return;
    }

    this.resetForm();
    this.isSpinning.set(true);

    const request: PlacaRequest = {
      numPlaca: this.form.controls.placa.value?.trim().toUpperCase()
    }

    this.replaqueoService.verificar(request).pipe(
      finalize( () => this.isSpinning.set(false)),
      catchError((e: HttpErrorResponse) => {
        console.log(e);
        let mensajeError = 'Error inesperado';
        if (e.status === 0) {
          mensajeError = 'El servidor no responde';
          this.error.set(true);
        } else {
          mensajeError = e.error?.response ?? `Error del servidor: ${e.status}`;
          this.error.set(!e.error?.response);
        }
        return throwError(() => new Error(mensajeError) );
      })
    ).subscribe({
        next:(respuesta: PlacaResponse) =>{
          this.resultado.set(respuesta.response ? respuesta.response : 'Sin resultado')
          this.tableData.set(respuesta);
          this.error.set(!respuesta.observaciones);
        },
        error: (e: Error) => {
          console.error(e);
          this.resultado.set(e.message);
        }
      }
    )

  }

  filtrarInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const valorFiltrado = input.value.toUpperCase().replaceAll(/[^A-Z0-9Ñ]/g, '');

    this.form.controls.placa.setValue(valorFiltrado, { emitEvent: false} );
    
    if(!valorFiltrado) this.resetForm();
  }

  private resetForm() {
    this.resultado.set('');
    this.error.set(false);
  }

}
