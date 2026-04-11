import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StatusPedido } from '../../domain/enums/statusPedido.enum';

export class AtualizarStatusDto {
  @ApiProperty({ enum: StatusPedido, example: StatusPedido.EM_PREPARO })
  @IsEnum(StatusPedido, {
    message: `status deve ser um dos valores: ${Object.values(StatusPedido).join(', ')}`,
  })
  novoStatus!: StatusPedido;
}