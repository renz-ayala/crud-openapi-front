import { Component, inject, signal } from '@angular/core';
import { PlacaControllerService, PlacaRequest, PlacaResponse } from '../../api';

@Component({
  selector: 'app-consultar-placa',
  standalone: false,
  templateUrl: './consultar-placa.component.html',
  styleUrls: ['./consultar-placa.component.scss']
})
export class ConsultarPlacaComponent {

  placa = signal('');
  resultado = signal('');
  cargando = signal(false);
  error = signal('');
  mostrarError = signal(false);

  private readonly replaqueoService = inject(PlacaControllerService);

  consultar() {
    this.resultado.set('');
    this.error.set('');
    this.mostrarError.set(false);

    if (!this.placa().trim()) {
      this.mostrarError.set(true);
      return;
    }

    const placa = this.placa().trim().toUpperCase();    
    const tieneLetra = /[A-Z]/.test(placa);
    const tieneNumero = /[0-9]/.test(placa);
    if (!tieneLetra || !tieneNumero) {
      this.mostrarError.set(true);
      this.error.set('Error: Formato inválido.');
      return;
    }

    this.cargando.set(true);
    const request: PlacaRequest = {
      numPlaca: this.placa().trim().toUpperCase()
    }
    this.replaqueoService.verificar(request).subscribe({
        next:(respuesta: PlacaResponse) =>{
          this.resultado.set(respuesta.observaciones ? respuesta.observaciones : 'Sin resultado')
          this.cargando.set(false);
        },
        error: (e) => {
          console.error(e);
          this.error.set('Error consultando placa.');
          this.cargando.set(false);
        }
      }
    )

  }

  filtrarInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const valorFiltrado = input.value.toUpperCase().replace(/[^A-Z0-9Ñ]/g, '');
    this.placa.set(valorFiltrado);
    input.value = valorFiltrado;

    if (this.placa().length === 0) {
      this.resultado.set('');
      this.error.set('');
    }
  }

}
