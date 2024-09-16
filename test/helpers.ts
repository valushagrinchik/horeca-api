import { INestApplication } from '@nestjs/common'
import { ENDPOINTS } from './constants'
import * as request from 'supertest'
import { LoginUserDto } from './../src/users/dto/login-user.dto'
import { RegistrateUserDto } from './../src/users/dto/registrate-user.dto'
import { UpdateUserDto } from './../src/users/dto/update-user.dto'

export const registrateUser = async (app: INestApplication, payload: RegistrateUserDto) => {
    return request(app.getHttpServer())
        .post(ENDPOINTS.SIGNUP)
        .send(payload)
        .then(res => res.body)
}

export const authUser = async (app: INestApplication, payload: LoginUserDto) => {
    return request(app.getHttpServer())
        .post(ENDPOINTS.SIGNIN)
        .send({
            email: payload.email,
            password: payload.password,
        })
        .then(res => res.body)
}

export const activateUser = async (app: INestApplication, activationLink: string) => {
    await request(app.getHttpServer()).get(ENDPOINTS.ACTIVATE_PROFILE.replace(':uuid', activationLink))
}

export const prepareForChat = async ( app: INestApplication ) => {
    const horecaAuthRes = await request(app.getHttpServer())
        .post(ENDPOINTS.SIGNIN)
        .send({ email: 'horeca@test.com', password:'horeca!' })
        .then(res => {
            return res.body
        })

    const horecaCreateRequestRes = await request(app.getHttpServer())
        .post(ENDPOINTS.CREATE_HOREKA_REQUEST)
        .set('Authorization', 'Bearer ' + horecaAuthRes.accessToken)
        .send({
            items: [
                {
                    name: 'string',
                    amount: 10,
                    unit: 'string',
                    category: 'alcoholicDrinks',
                },
            ],
            address: 'string',
            deliveryTime: '2024-09-04T12:15:13.337Z',
            acceptUntill: '2024-09-04T12:15:13.337Z',
            paymentType: 'Prepayment',
            name: 'string',
            phone: 'string',
            comment: 'string',
        })
        .then(res => {
            return res.body
        })
    const providerAuthRes = await request(app.getHttpServer())
        .post(ENDPOINTS.SIGNIN)
        .send({ email: 'provider@test.com', password:'provider!' })
        .then(res => {
            return res.body
        })
    const providerCreateRequestRes = await request(app.getHttpServer())
        .post(ENDPOINTS.CREATE_PROVIDER_REQUEST)
        .set('Authorization', 'Bearer ' + providerAuthRes.accessToken)
        .send({
            horecaRequestId: horecaCreateRequestRes.id,
            comment: 'string',
            available: true,
            manufacturer: 'string',
            paymentType: 'Prepayment',
            cost: 2000,
        })
        .then(res => {
            return res.body
        })

    await request(app.getHttpServer())
        .post(ENDPOINTS.APPROVE_PROVIDER_REQUEST.replace(':id', providerCreateRequestRes.id))
        .set('Authorization', 'Bearer ' + horecaAuthRes.accessToken)
        .then(res => {
            return res.body
        })

    return {
        horecaToken: horecaAuthRes.accessToken,
        providerToken: providerAuthRes.accessToken,
        providerRequestId: providerCreateRequestRes.id,
        opponentId: providerCreateRequestRes.userId,
    }
}


export const getProfile = async (app: INestApplication, accessToken: string) => {
    return request(app.getHttpServer())
        .get(ENDPOINTS.PROFILE)
        .set('Authorization', 'Bearer ' + accessToken)
        .then(res => res.body)
}

export const updateProfile = async (app: INestApplication, accessToken: string, payload: UpdateUserDto) => {
    return request(app.getHttpServer())
        .put(ENDPOINTS.PROFILE)
        .set('Authorization', 'Bearer ' + accessToken)
        .send(payload)
        .then(res => res.body)
}