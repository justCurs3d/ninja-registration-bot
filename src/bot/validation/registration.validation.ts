const NAME_MIN = 2;
const NAME_MAX = 80;
const AGE_MIN = 2;
const AGE_MAX = 99;

export type ValidationResult<T> = {
    ok: boolean;
    value?: T;
    error?: string;
}

export function validateNameInput(text: string): ValidationResult<string> {
    const name = text.trim().replace(/\s+/g, ' ');
    if (name.length < NAME_MIN) {
        return { ok: false, error: `Имя слишком короткое. Нужно хотя бы ${NAME_MIN} буквы.` };
    }
    if (name.length > NAME_MAX) {
        return { ok: false, error: `Имя слишком длинное (максимум ${NAME_MAX} символов).` };
    }
    if (!/^[\p{L}\s\-']+$/u.test(name)) {
        return { ok: false, error: 'Используй только буквы, пробел, дефис или апостроф.' };
    }
    return { ok: true, value: name };
}

export function validateAgeInput(text: string): ValidationResult<number> {
    const t = text.trim();
    if (!/^\d{1,3}$/.test(t)) {
        return { ok: false, error: 'Напиши возраст числом, например: 16' };
    }
    const age = Number(t);
    if (age < AGE_MIN || age > AGE_MAX) {
        return { ok: false, error: `Укажи реальный возраст` };
    }
    return { ok: true, value: age };
}

const LOGIN_MIN = 3;
const LOGIN_MAX = 32;
const PASSWORD_MIN = 8;
const PASSWORD_MAX = 64;

export function validateLoginInput(text: string): ValidationResult<string> {
    const login = text.trim();
    if (login.length < LOGIN_MIN) {
        return { ok: false, error: `Логин должен быть не короче ${LOGIN_MIN} символов.` };
    }
    if (login.length > LOGIN_MAX) {
        return { ok: false, error: `Логин должен быть не длиннее ${LOGIN_MAX} символов.` };
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(login)) {
        return { ok: false, error: 'Логин может содержать только латинские буквы, цифры, знак _ или -' };
    }
    if (!/[a-zA-Z]/.test(login)) {
        return { ok: false, error: 'Логин должен содержать хотя бы одну латинскую букву.' };
    }
    return { ok: true, value: login };
}

export function validatePasswordInput(text: string): ValidationResult<string> {
    const password = text.trim();
    if (/\s/.test(password)) {
        return { ok: false, error: 'Пароль не должен содержать пробелы.' };
    }
    if (password.length < PASSWORD_MIN) {
        return { ok: false, error: `Пароль должен быть не короче ${PASSWORD_MIN} символов.` };
    }
    if (password.length > PASSWORD_MAX) {
        return { ok: false, error: `Пароль должен быть не длиннее ${PASSWORD_MAX} символов.` };
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(password)) {
        return { ok: false, error: 'Пароль может содержать только латинские буквы, цифры, знак _ или -' };
    }
    return { ok: true, value: password };
}
