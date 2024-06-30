import { ApiProperty } from "@nestjs/swagger";
import { Application, ApplicationImage, PaymentType } from "@prisma/client";

export class ApplicationDto implements Application {
    @ApiProperty()
    id: number

    @ApiProperty()
    profileId: number
  
    @ApiProperty()
    proposalId: number
  
    @ApiProperty()
    images: ApplicationImage[]

    @ApiProperty()
    comment: string

    @ApiProperty()
    available: boolean // in stock

    @ApiProperty()
    manufacturer: string

    @ApiProperty()
    paymentType:  PaymentType   

    @ApiProperty()
    cost: number

    @ApiProperty()
    createdAt: Date

    @ApiProperty()
    updatedAt: Date

    constructor(partial: Partial<Application>) {
        Object.assign(this, partial)
    }
}