import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ConfiguracaoService } from '../../core/configuracao.service';
import { ConfiguracaoOficina } from '../../core/models';

const LIMITE_LOGO_BYTES = 500 * 1024;

@Component({
  selector: 'app-configuracoes',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './configuracoes.html',
  styleUrl: './configuracoes.css',
})
export class Configuracoes {
  private fb = inject(FormBuilder);
  private configuracaoService = inject(ConfiguracaoService);

  carregando = signal(true);
  salvando = signal(false);
  enviandoLogo = signal(false);
  erro = signal<string | null>(null);
  erroLogo = signal<string | null>(null);
  sucesso = signal<string | null>(null);
  logo = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    nome: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)]],
    razaoSocial: ['', [Validators.maxLength(150)]],
    cnpj: ['', [Validators.maxLength(18)]],
    endereco: ['', [Validators.maxLength(200)]],
    telefone: ['', [Validators.maxLength(20)]],
    email: ['', [Validators.email, Validators.maxLength(120)]],
  });

  constructor() {
    this.configuracaoService.buscar().subscribe({
      next: (config) => {
        this.preencher(config);
        this.carregando.set(false);
      },
      error: () => {
        this.carregando.set(false);
        this.erro.set('Não foi possível carregar as configurações.');
      },
    });
  }

  salvar(): void {
    if (this.salvando()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.salvando.set(true);
    this.erro.set(null);
    this.sucesso.set(null);

    const v = this.form.getRawValue();
    this.configuracaoService
      .atualizar({
        nome: v.nome.trim(),
        razaoSocial: v.razaoSocial.trim(),
        cnpj: v.cnpj.trim(),
        endereco: v.endereco.trim(),
        telefone: v.telefone.trim(),
        email: v.email.trim(),
      })
      .subscribe({
        next: (config) => {
          this.preencher(config);
          this.salvando.set(false);
          this.sucesso.set('Dados salvos.');
        },
        error: (e: HttpErrorResponse) => {
          this.salvando.set(false);
          this.erro.set(e.error?.mensagem ?? 'Não foi possível salvar. Tente novamente.');
        },
      });
  }

  escolherLogo(evento: Event): void {
    const campo = evento.target as HTMLInputElement;
    const arquivo = campo.files?.[0];
    campo.value = '';
    if (!arquivo) return;

    this.erroLogo.set(null);
    if (arquivo.type !== 'image/png' && arquivo.type !== 'image/jpeg') {
      this.erroLogo.set('Envie uma imagem PNG ou JPEG.');
      return;
    }
    if (arquivo.size > LIMITE_LOGO_BYTES) {
      this.erroLogo.set('O logo deve ter no máximo 500 KB.');
      return;
    }

    this.enviandoLogo.set(true);
    this.configuracaoService.enviarLogo(arquivo).subscribe({
      next: (config) => {
        this.logo.set(config.logo);
        this.enviandoLogo.set(false);
      },
      error: (e: HttpErrorResponse) => {
        this.enviandoLogo.set(false);
        this.erroLogo.set(e.error?.mensagem ?? 'Não foi possível enviar o logo.');
      },
    });
  }

  removerLogo(): void {
    if (!window.confirm('Remover o logo da oficina?')) return;

    this.enviandoLogo.set(true);
    this.erroLogo.set(null);
    this.configuracaoService.removerLogo().subscribe({
      next: (config) => {
        this.logo.set(config.logo);
        this.enviandoLogo.set(false);
      },
      error: () => {
        this.enviandoLogo.set(false);
        this.erroLogo.set('Não foi possível remover o logo.');
      },
    });
  }

  private preencher(config: ConfiguracaoOficina): void {
    this.form.reset({
      nome: config.nome,
      razaoSocial: config.razaoSocial ?? '',
      cnpj: this.formatarCnpj(config.cnpj),
      endereco: config.endereco ?? '',
      telefone: config.telefone ?? '',
      email: config.email ?? '',
    });
    this.logo.set(config.logo);
  }

  private formatarCnpj(digitos: string | null): string {
    if (!digitos || digitos.length !== 14) return digitos ?? '';
    return `${digitos.slice(0, 2)}.${digitos.slice(2, 5)}.${digitos.slice(5, 8)}/${digitos.slice(8, 12)}-${digitos.slice(12)}`;
  }
}
