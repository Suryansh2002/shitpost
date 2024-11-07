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
        if (new Date().getTime() - setAt.getTime() > 180000) {
            pendingValidations.delete(username);
        }
    }
}

export function isValidShortsLink(url:string): {videoId:string|null}{
    const patterns = [
        /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})(?:\?.*)?$/,
        /^(?:https?:\/\/)?m\.youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})(?:\?.*)?$/,
        /^(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{11})(?:\?.*)?$/
    ];

    try {
        new URL(url);
    } catch (error) {
        return {videoId: null};
    }
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1].length === 11){
            return {videoId: match[1]};
        }
    }
    return {videoId: null};
}