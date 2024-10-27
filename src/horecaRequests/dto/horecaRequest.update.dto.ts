import { PartialType } from '@nestjs/swagger'
import { HorecaRequestCreateDto } from './horecaRequest.create.dto'

export class HorecaRequestUpdateDto extends PartialType(HorecaRequestCreateDto) {}
