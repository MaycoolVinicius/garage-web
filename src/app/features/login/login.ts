import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  carregando = signal(false);
  erro = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    senha: ['', Validators.required],
  });

  entrar(): void {
    if (this.form.invalid || this.carregando()) return;

    this.carregando.set(true);
    this.erro.set(null);
    const { username, senha } = this.form.getRawValue();

    this.auth.login(username.trim(), senha).subscribe({
      next: () => this.router.navigate(['/os']),
      error: (e: HttpErrorResponse) => {
        this.carregando.set(false);
        this.erro.set(
          e.status === 401
            ? 'Usuário ou senha inválidos.'
            : 'Não foi possível conectar ao servidor. Tente novamente em instantes.',
        );
      },
    });
  }
}
