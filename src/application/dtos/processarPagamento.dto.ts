import { IsUUID, IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProcessarPagamentoDto {
  @ApiProperty({ example: 'uuid-do-pedido' })
  @IsUUID()
  pedidoId!: string;

  @ApiProperty({ example: 89.70 })
  @IsNumber()
  @Min(0.01)
  valor!: number;

  @ApiProperty({ example: 'MOCK' })
  @IsString()
  formaPagamento!: string;
}