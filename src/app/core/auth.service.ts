import { HttpClient } from "@angular/common/http";
import { Injectable, computed, inject, signal } from "@angular/core";
import { Router } from "@angular/router";
import { Observable, tap } from "rxjs";
import { TokenResponse } from "./models";

const CHAVE_TOKEN = "oficina.token";
const CHAVE_EXPIRA = "oficina.expira";

@Injectable({ providedIn: "root" })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private tokenAtual = signal<string | null>(this.lerArmazenado(CHAVE_TOKEN));
  private expiraEm = signal<string | null>(this.lerArmazenado(CHAVE_EXPIRA));

  readonly logado = computed(() => {
    const token = this.tokenAtual();
    const expira = this.expiraEm();
    if (!token || !expira) return false;
    const quando = Date.parse(expira);
    return !Number.isNaN(quando) && quando > Date.now();
  });

  token(): string | null {
    return this.logado() ? this.tokenAtual() : null;
  }

  login(username: string, senha: string): Observable<TokenResponse> {
    return this.http
      .post<TokenResponse>("/api/auth/login", { username, senha })
      .pipe(tap((resposta) => this.guardar(resposta)));
  }

  logout(): void {
    this.tokenAtual.set(null);
    this.expiraEm.set(null);
    this.removerArmazenado(CHAVE_TOKEN);
    this.removerArmazenado(CHAVE_EXPIRA);
    this.router.navigate(["/login"]);
  }

  private guardar(resposta: TokenResponse): void {
    this.tokenAtual.set(resposta.token);
    this.expiraEm.set(resposta.expiraEm);
    try {
      localStorage.setItem(CHAVE_TOKEN, resposta.token);
      localStorage.setItem(CHAVE_EXPIRA, resposta.expiraEm);
    } catch {
      // armazenamento indisponível: o login vale só até recarregar a página
    }
  }

  private lerArmazenado(chave: string): string | null {
    try {
      return localStorage.getItem(chave);
    } catch {
      return null;
    }
  }

  private removerArmazenado(chave: string): void {
    try {
      localStorage.removeItem(chave);
    } catch {
      // ignora
    }
  }
}
