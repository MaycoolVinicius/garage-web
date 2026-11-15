import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  of,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { OrdemServicoResumo } from '../../core/models';
import { OsService } from '../../core/os.service';

@Component({
  selector: 'app-os-lista',
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './os-lista.html',
  styleUrl: './os-lista.css',
})
export class OsLista {
  private osService = inject(OsService);

  busca = new FormControl('', { nonNullable: true });
  ordens = signal<OrdemServicoResumo[]>([]);
  carregando = signal(true);
  erro = signal<string | null>(null);

  constructor() {
    this.busca.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        startWith(''),
        tap(() => {
          this.carregando.set(true);
          this.erro.set(null);
        }),
        switchMap((termo) =>
          this.osService.listar(termo).pipe(
            catchError(() => {
              this.erro.set('Não foi possível carregar as ordens de serviço.');
              return of([] as OrdemServicoResumo[]);
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((lista) => {
        this.ordens.set(lista);
        this.carregando.set(false);
      });
  }
}
