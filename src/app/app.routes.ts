import { Routes } from '@angular/router';

import { Layout } from './core/layout/layout';

export const routes: Routes = [
  {
    path: '',
    component: Layout,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        title: 'Dashboard · Fluxo',
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'transacoes',
        title: 'Transações · Fluxo',
        loadComponent: () => import('./features/transacoes/transacoes').then((m) => m.Transacoes),
      },
      {
        path: 'guardado',
        title: 'Guardado · Fluxo',
        loadComponent: () => import('./features/guardado/guardado').then((m) => m.Guardado),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
