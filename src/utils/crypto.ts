import * as crypto from 'crypto'

export const generatePassword = (password: string, salt: string = process.env.CRYPTO_SALT) => {
    return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
}
export const validPassword = (password: string, hash: string, salt: string = process.env.CRYPTO_SALT) => {
    const checkHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex')
    return hash === checkHash
}
