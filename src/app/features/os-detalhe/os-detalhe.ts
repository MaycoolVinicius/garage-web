import { CurrencyPipe, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { OrdemServicoResponse } from '../../core/models';
import { OsService } from '../../core/os.service';

@Component({
  selector: 'app-os-detalhe',
  imports: [RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './os-detalhe.html',
  styleUrl: './os-detalhe.css',
})
export class OsDetalhe {
  private osService = inject(OsService);
  private route = inject(ActivatedRoute);

  private id = Number(this.route.snapshot.paramMap.get('id'));

  os = signal<OrdemServicoResponse | null>(null);
  carregando = signal(true);
  erro = signal<string | null>(null);
  gerandoPdf = signal(false);
  erroPdf = signal<string | null>(null);

  constructor() {
    if (!Number.isInteger(this.id) || this.id <= 0) {
      this.carregando.set(false);
      this.erro.set('Ordem de serviço inválida.');
      return;
    }

    this.osService.buscar(this.id).subscribe({
      next: (os) => {
        this.os.set(os);
        this.carregando.set(false);
      },
      error: (e: HttpErrorResponse) => {
        this.carregando.set(false);
        this.erro.set(
          e.status === 404
            ? 'Ordem de serviço não encontrada.'
            : 'Não foi possível carregar a ordem de serviço.',
        );
      },
    });
  }

  gerarPdf(modo: 'abrir' | 'baixar'): void {
    if (this.gerandoPdf()) return;

    // a aba é aberta já no clique, antes da resposta, para o navegador não bloquear o popup
    const janela = modo === 'abrir' ? window.open('', '_blank') : null;

    this.gerandoPdf.set(true);
    this.erroPdf.set(null);

    this.osService.pdf(this.id).subscribe({
      next: (blob) => {
        this.gerandoPdf.set(false);
        const url = URL.createObjectURL(blob);

        if (janela) {
          janela.location.href = url;
        } else {
          const link = document.createElement('a');
          link.href = url;
          link.download = `os-${this.id}.pdf`;
          link.click();
        }

        setTimeout(() => URL.revokeObjectURL(url), 60_000);
      },
      error: () => {
        janela?.close();
        this.gerandoPdf.set(false);
        this.erroPdf.set('Não foi possível gerar o PDF. Tente novamente.');
      },
    });
  }
}
