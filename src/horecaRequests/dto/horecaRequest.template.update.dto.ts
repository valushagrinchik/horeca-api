import { PartialType } from '@nestjs/swagger'
import { HorecaRequestTemplateCreateDto } from './horecaRequest.template.create.dto'

export class HorecaRequestTemplateUpdateDto extends PartialType(HorecaRequestTemplateCreateDto) {}
