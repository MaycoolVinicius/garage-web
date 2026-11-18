import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ConfiguracaoOficina, ConfiguracaoRequest } from './models';

@Injectable({ providedIn: 'root' })
export class ConfiguracaoService {
  private http = inject(HttpClient);

  private atual = signal<ConfiguracaoOficina | null>(null);
  readonly nome = computed(() => this.atual()?.nome ?? '');

  /** Carrega em segundo plano, para o cabeçalho. Falha em silêncio. */
  carregar(): void {
    this.buscar().subscribe({ error: () => {} });
  }

  buscar(): Observable<ConfiguracaoOficina> {
    return this.http
      .get<ConfiguracaoOficina>('/api/configuracao')
      .pipe(tap((config) => this.atual.set(config)));
  }

  atualizar(dados: ConfiguracaoRequest): Observable<ConfiguracaoOficina> {
    return this.http
      .put<ConfiguracaoOficina>('/api/configuracao', dados)
      .pipe(tap((config) => this.atual.set(config)));
  }

  enviarLogo(arquivo: File): Observable<ConfiguracaoOficina> {
    const dados = new FormData();
    dados.append('arquivo', arquivo);
    return this.http
      .put<ConfiguracaoOficina>('/api/configuracao/logo', dados)
      .pipe(tap((config) => this.atual.set(config)));
  }

  removerLogo(): Observable<ConfiguracaoOficina> {
    return this.http
      .delete<ConfiguracaoOficina>('/api/configuracao/logo')
      .pipe(tap((config) => this.atual.set(config)));
  }
}
