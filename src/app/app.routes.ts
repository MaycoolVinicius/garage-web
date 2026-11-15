import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { Login } from './features/login/login';
import { OsLista } from './features/os-lista/os-lista';
import { OsNova } from './features/os-nova/os-nova';

export const routes: Routes = [
  { path: 'os/nova', component: OsNova, canActivate: [authGuard] },
  { path: 'login', component: Login },
  { path: 'os', component: OsLista, canActivate: [authGuard] },
  { path: '', pathMatch: 'full', redirectTo: 'os' },
  { path: '**', redirectTo: 'os' },
];
