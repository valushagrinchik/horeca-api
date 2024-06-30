import { ApiProperty } from '@nestjs/swagger'
import { PaymentType, Proposal, ProposalImage, ProposalItem } from '@prisma/client'

export class ProposalDto implements Proposal {
    @ApiProperty()
    id: number

    @ApiProperty()
    profileId: number

    @ApiProperty()
    address: string

    @ApiProperty()
    deliveryTime: Date

    @ApiProperty()
    acceptUntill: Date

    @ApiProperty()
    paymentType: PaymentType

    @ApiProperty()
    name: string

    @ApiProperty()
    phone: string

    @ApiProperty()
    items:  ProposalItem[]

    @ApiProperty()
    images: ProposalImage[]

    @ApiProperty()
    comment: string

    @ApiProperty()
    createdAt: Date

    @ApiProperty()
    updatedAt: Date

    constructor(partial: Partial<Proposal>) {
        Object.assign(this, partial)
    }
}