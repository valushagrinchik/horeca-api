import { ApiProperty } from '@nestjs/swagger'
import { HorecaApplication, HorecaApplicationImage, HorecaApplicationItem, PaymentType } from '@prisma/client'

export class ProposalHorecaDto implements HorecaApplication {
    @ApiProperty()
    id: number

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
    items:  HorecaApplicationItem[]

    @ApiProperty()
    images: HorecaApplicationImage[]

    @ApiProperty()
    comment: string

    @ApiProperty()
    createdAt: Date

    @ApiProperty()
    updatedAt: Date

    constructor(partial: Partial<HorecaApplication>) {
        Object.assign(this, partial)
    }
}