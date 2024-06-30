import { TypeValidate, Validate } from 'src/utils/validation/validate.decotators'
import { CreateProposalHorecaDto } from './create-proposal.horeca.dto'

export class CreateProposalTemplateHorecaDto {
    @Validate(TypeValidate.STRING)
    name: string

    @Validate(TypeValidate.OBJECT)
    content: CreateProposalHorecaDto
}
