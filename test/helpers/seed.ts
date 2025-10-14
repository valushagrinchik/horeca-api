import { Roles } from "@/auth/decorators/roles.decorator"
import { Categories } from "@/shared/utils"
import { DatabaseService } from "@/system/database/database.service"
import { HorecaRequestStatus, PaymentType, ProfileType, ProviderRequestStatus, UserRole } from "@prisma/client"

export async function cleanDatabase(db: DatabaseService) {
    await db.user.deleteMany({})
    await db.supportRequest.deleteMany({})
    await db.providerRequest.deleteMany({})
    await db.horecaRequest.deleteMany({})
    await db.chat.deleteMany({})
    await db.chatMessage.deleteMany({})
    await db.horecaFavourites.deleteMany({})
}

export const seedHorecaCompleteDataCase = async (db: DatabaseService) => {
    const horecaUser = await db.user.create({
        data: {
            email: 'horeca@test.com',
            password: 'horeca!',
            name: 'Horeca',
            tin: '123456789',
            role: UserRole.Horeca,
            profile: {
                create: {
                    profileType: ProfileType.Horeca,
                }
            },
            horecaRequests: {
                create: {
                    name: 'Horeca Request',
                    phone: '123456789',
                    address: 'Address',
                    deliveryTime: new Date(),
                    acceptUntill: new Date(),
                    paymentType: PaymentType.Deferment,
                    status: HorecaRequestStatus.Pending,
                    items: {
                        createMany: {data: [{
                            name: 'Item 1',
                            amount: 10,
                            unit: 'kg',
                            category: Categories.bakeryProducts,
                        }]}
                    }
             
                }
            },      
        },
        include: {
            horecaRequests: {
                include: {
                    items: true,
                }
            },
        }
    })
    const providerUser = await db.user.create({      
        data: {
            email: 'provider@test.com',
            password: 'provider!',
            name: 'Provider',
            tin: '123456789',
            role: UserRole.Provider,
            profile: {
                create: {
                    profileType: ProfileType.Provider,
                }
            },
        }
    })
    await db.providerRequest.create({
        data: {
            horecaRequest: {
                connect: {
                    id: horecaUser.horecaRequests[0].id
                }
            },
            user: {
                connect: {
                    id: providerUser.id
                }
            },
            status: ProviderRequestStatus.Pending,
            items: {
                createMany: {data: [{
                   horecaRequestItemId: horecaUser.horecaRequests[0].items[0].id,
                   manufacturer: 'Manufacturer',
                   cost: 10,
                }]}
            }
        }
    })
    
    return horecaUser.id
}

