import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { OrdemServicoRequest, OrdemServicoResponse, OrdemServicoResumo } from './models';

@Injectable({ providedIn: 'root' })
export class OsService {
  private http = inject(HttpClient);

  listar(busca?: string): Observable<OrdemServicoResumo[]> {
    let params = new HttpParams();
    if (busca?.trim()) {
      params = params.set('busca', busca.trim());
    }
    return this.http.get<OrdemServicoResumo[]>('/api/os', { params });
  }

  buscar(id: number): Observable<OrdemServicoResponse> {
    return this.http.get<OrdemServicoResponse>(`/api/os/${id}`);
  }

  criar(requisicao: OrdemServicoRequest): Observable<OrdemServicoResponse> {
    return this.http.post<OrdemServicoResponse>('/api/os', requisicao);
  }

  pdf(id: number): Observable<Blob> {
    return this.http.get(`/api/os/${id}/pdf`, { responseType: 'blob' });
  }
}
