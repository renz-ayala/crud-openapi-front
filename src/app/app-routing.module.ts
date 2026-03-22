import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: 'consultar',
    loadComponent: () => import('./pages/consultar-placa/consultar-placa.component')
      .then(m => m.ConsultarPlacaComponent) },
  { path: '', redirectTo: '/consultar', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
