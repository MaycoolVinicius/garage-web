import { Component, effect, inject, untracked } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';
import { ConfiguracaoService } from './core/configuracao.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected auth = inject(AuthService);
  protected configuracao = inject(ConfiguracaoService);

  constructor() {
    effect(() => {
      if (this.auth.logado()) {
        untracked(() => this.configuracao.carregar());
      }
    });
  }
}
