import { Component, computed, inject, signal } from '@angular/core';
import { PlacaControllerService, PlacaRequest, PlacaResponse } from '../../api';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, finalize, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-consultar-placa',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './consultar-placa.component.html',
  styleUrls: ['./consultar-placa.component.scss']
})
export class ConsultarPlacaComponent{

  private readonly replaqueoService = inject(PlacaControllerService);
  private readonly fb = inject(FormBuilder);

  resultado = signal('');
  error = signal(false);
  isSpinning = signal(false);
  
  textoBoton = computed(() => this.isSpinning() ? 'Buscando...' : 'Realizar Búsqueda');
  cssResultado = computed(() => this.error() ? 'error' : 'resultado')

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
          this.resultado.set(respuesta.observaciones ? respuesta.observaciones : 'Sin resultado')
          this.error.set(false)
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
