import { IsEnum, IsString, IsUUID, IsArray,
         ValidateNested, IsInt, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CanalPedido } from '../../domain/enums/canalPedido.enum';

export class ItemPedidoDto {
  @ApiProperty({ example: 'uuid-do-produto' })
  @IsUUID()
  produtoId!: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1, { message: 'Quantidade mínima é 1' })
  quantidade!: number;
}

export class CriarPedidoDto {
  @ApiProperty({ enum: CanalPedido, example: CanalPedido.TOTEM })
  @IsEnum(CanalPedido, {
    message: `canalPedido deve ser um dos valores: ${Object.values(CanalPedido).join(', ')}`,
  })
  canalPedido!: CanalPedido;

  @ApiProperty({ example: 'uuid-da-unidade' })
  @IsUUID()
  unidadeId!: string;

  @ApiProperty({ type: [ItemPedidoDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemPedidoDto)
  itens!: ItemPedidoDto[];

  @ApiProperty({ example: 'MOCK' })
  @IsString()
  formaPagamento!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  clienteId?: string;

  @IsOptional()
  @IsString()
  idempotencyKey?: string;
}