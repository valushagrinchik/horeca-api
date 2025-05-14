export const generateFutureDate = (days: number = 7) => {
    const now = new Date()
    const validAcceptUntill = new Date()
    validAcceptUntill.setDate(now.getDate() + days)
    validAcceptUntill.setUTCHours(0, 0, 0, 0)
    return validAcceptUntill
}
