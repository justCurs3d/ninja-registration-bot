export class AllTokensInvalidError extends Error {
    constructor() {
        super('Не найдено ни одного валидного токена');
    }
}
