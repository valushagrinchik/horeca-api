import { TypeValidate, Validate } from 'src/utils/validation/validate.decotators'
import { CreateProposalDto } from './create-proposal.dto'

export class CreateProposalTemplateDto {
    @Validate(TypeValidate.STRING)
    name: string

    @Validate(TypeValidate.OBJECT)
    content: CreateProposalDto
}
