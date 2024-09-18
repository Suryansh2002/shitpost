type PendingValidation = {
    otp: number;
    email: string;
    username: string;
    password: string;
    setAt: Date;
  };

export function isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
}
  
export const pendingValidations = new Map<string,PendingValidation>();

export function clearValidationCache() {
    for (const [username, { setAt }] of pendingValidations) {
        if (new Date().getTime() - setAt.getTime() > 60000) {
            pendingValidations.delete(username);
        }
    }
}