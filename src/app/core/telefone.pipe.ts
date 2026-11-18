import { Pipe, PipeTransform } from '@angular/core';
import { formatarTelefone } from './formatos';

@Pipe({ name: 'telefone' })
export class TelefonePipe implements PipeTransform {
  transform(valor: string | null | undefined): string {
    return formatarTelefone(valor);
  }
}
