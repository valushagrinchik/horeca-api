import { ProviderRequestReview } from '@prisma/client'
export class ReviewDto implements ProviderRequestReview {
    id: number
    userId: number
    isDelivered: number
    isSuccessfully: number
    providerRequestId: number
    createdAt: Date
    updatedAt: Date
    constructor(review: Partial<ProviderRequestReview>) {
        Object.assign(this, review)
    }
}
