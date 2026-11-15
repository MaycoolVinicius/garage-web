import { HttpErrorResponse } from '@angular/common/http';
import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { startWith } from 'rxjs';
import { OrdemServicoRequest, TipoItem } from '../../core/models';
import { OsService } from '../../core/os.service';

function semBranco(controle: AbstractControl): ValidationErrors | null {
  const valor = controle.value;
  return typeof valor === 'string' && valor.trim() === '' ? { branco: true } : null;
}

@Component({
  selector: 'app-os-nova',
  imports: [ReactiveFormsModule, RouterLink, CurrencyPipe],
  templateUrl: './os-nova.html',
  styleUrl: './os-nova.css',
})
export class OsNova {
  private fb = inject(FormBuilder);
  private osService = inject(OsService);
  private router = inject(Router);

  enviando = signal(false);
  erro = signal<string | null>(null);
  total = signal(0);

  form = this.fb.nonNullable.group({
    nomeCliente: ['', [Validators.required, semBranco, Validators.maxLength(120)]],
    telefone: ['', [Validators.required, semBranco, Validators.maxLength(20)]],
    placa: ['', [Validators.required, semBranco, Validators.maxLength(10)]],
    itens: this.fb.array([this.novoItem()], Validators.minLength(1)),
  });

  constructor() {
    this.form.controls.itens.valueChanges
      .pipe(startWith(null), takeUntilDestroyed())
      .subscribe(() => this.total.set(this.calcularTotal()));
  }

  get itens() {
    return this.form.controls.itens;
  }

  adicionarItem(): void {
    this.itens.push(this.novoItem());
  }

  removerItem(indice: number): void {
    if (this.itens.length > 1) {
      this.itens.removeAt(indice);
    }
  }

  salvar(): void {
    if (this.enviando()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.getRawValue();
    const requisicao: OrdemServicoRequest = {
      nomeCliente: valores.nomeCliente.trim(),
      telefone: valores.telefone.trim(),
      placa: valores.placa.trim(),
      itens: valores.itens.map((i) => ({
        tipo: i.tipo,
        descricao: i.descricao.trim(),
        quantidade: i.quantidade,
        valorUnitario: i.valorUnitario,
      })),
    };

    this.enviando.set(true);
    this.erro.set(null);

    this.osService.criar(requisicao).subscribe({
      next: (os) => this.router.navigate(['/os', os.id]),
      error: (e: HttpErrorResponse) => {
        this.enviando.set(false);
        this.erro.set(
          e.status === 400
            ? 'O servidor recusou os dados. Confira os campos e tente de novo.'
            : 'Não foi possível salvar a OS. Tente novamente.',
        );
      },
    });
  }

  private novoItem() {
    return this.fb.nonNullable.group({
      tipo: ['SERVICO' as TipoItem, Validators.required],
      descricao: ['', [Validators.required, semBranco, Validators.maxLength(200)]],
      quantidade: [1, [Validators.required, Validators.min(1)]],
      valorUnitario: [0, [Validators.required, Validators.min(0)]],
    });
  }

  private calcularTotal(): number {
    const centavos = this.itens.getRawValue().reduce((soma, item) => {
      const preco = Math.round((Number(item.valorUnitario) || 0) * 100);
      const qtd = Number(item.quantidade) || 0;
      return soma + preco * qtd;
    }, 0);
    return centavos / 100;
  }
}
