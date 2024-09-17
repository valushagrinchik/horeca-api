import { INestApplication } from '@nestjs/common'
import { ENDPOINTS } from './constants'
import * as request from 'supertest'
import { LoginUserDto } from './../src/users/dto/login-user.dto'
import { RegistrateUserDto } from './../src/users/dto/registrate-user.dto'
import { UpdateUserDto } from './../src/users/dto/update-user.dto'
import { HorecaRequestCreateDto } from './../src/horecaRequests/dto/horecaRequest.create.dto'
import { Categories } from './../src/system/utils/enums'
import { generateAcceptUntil } from './../src/system/utils/date'
import { PaginateValidateType } from './../src/system/utils/swagger/decorators'
import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing'
import { AppModule } from './../src/app.module'
import { AuthResultDto } from './../src/users/dto/auth.result.dto'

export const initApp = async (overwriteCb?: (mb: TestingModuleBuilder) => void, tmCb?: (tm: TestingModule) => void) => {
    const tmBuilder = Test.createTestingModule({
        imports: [AppModule],
    })
    if (overwriteCb) {
        overwriteCb(tmBuilder)
    }

    const tm = await tmBuilder.compile()

    if (tmCb) {
        tmCb(tm)
    }
    const app = tm.createNestApplication()
    await app.init()
    return app
}

export const registrateUser = async (app: INestApplication, payload: RegistrateUserDto) => {
    return request(app.getHttpServer())
        .post(ENDPOINTS.SIGNUP)
        .send(payload)
        .then(res => res.body)
}

export const authUser = async (app: INestApplication, payload: LoginUserDto): Promise<AuthResultDto | any> => {
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

export const createHorecaRequest = async (
    app: INestApplication,
    accessToken: string,
    payload: HorecaRequestCreateDto
) => {
    return request(app.getHttpServer())
        .post(ENDPOINTS.HOREKA_REQUESTS)
        .set('Authorization', 'Bearer ' + accessToken)
        .send(payload)
        .then(res => {
            return res.body
        })
}

export const getHorecaRequest = async (
    app: INestApplication,
    accessToken: string,
    id: number
) => {
    return request(app.getHttpServer())
        .get(ENDPOINTS.HOREKA_REQUEST.replace(':id', id.toString()))
        .set('Authorization', 'Bearer ' + accessToken)
        .then(res => {
            return res.body
        })
}


export const findAllHorecaRequest = async (
    app: INestApplication,
    accessToken: string,
    paginate: Partial<PaginateValidateType> = {}
) => {
    return request(app.getHttpServer())
        .get(ENDPOINTS.HOREKA_REQUESTS)
        .set('Authorization', 'Bearer ' + accessToken)
        .query(paginate)
        .then(res => {
            return res.body
        })
}

export const findAllHorecaRequestForProvider = async (
    app: INestApplication,
    accessToken: string,
    paginate: Partial<PaginateValidateType> = {}
) => {
    return request(app.getHttpServer())
        .get(ENDPOINTS.HOREKA_REQUESTS_FOR_PROVIDER)
        .set('Authorization', 'Bearer ' + accessToken)
        .query(paginate)
        .then(res => {
            return res.body
        })
}


export const prepareForChat = async (app: INestApplication) => {
    const horecaAuthRes = await request(app.getHttpServer())
        .post(ENDPOINTS.SIGNIN)
        .send({ email: 'horeca@test.com', password: 'horeca!' })
        .then(res => {
            return res.body
        })

    const validAcceptUntill = generateAcceptUntil()

    const horecaCreateRequestRes = await createHorecaRequest(app, horecaAuthRes.accessToken, {
        items: [
            {
                name: 'string',
                amount: 10,
                unit: 'string',
                category: Categories.alcoholicDrinks,
            },
        ],
        address: 'string',
        deliveryTime: validAcceptUntill,
        acceptUntill: validAcceptUntill,
        paymentType: 'Prepayment',
        name: 'string',
        phone: 'string',
        comment: 'string',
    })

    const providerAuthRes = await request(app.getHttpServer())
        .post(ENDPOINTS.SIGNIN)
        .send({ email: 'provider@test.com', password: 'provider!' })
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
