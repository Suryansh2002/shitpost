import crypto from 'crypto';

export function generateToken(payload:{[key:string]:any}){
    const header = btoa(JSON.stringify({alg: 'HS256', typ: 'JWT'}));
    const payloadBase64 = btoa(JSON.stringify(payload));
    const claim = `${header}.${payloadBase64}`;

    const signature = crypto.createHmac('sha256',
        process.env.AUTH_SECRET!,
    ).update(claim).digest('base64');

    return `${claim}.${signature}`;
}


export function decodeToken(token:string):{[key:string]:any}|undefined{
    const [header, payload, signature] = token.split('.');

    const newSignature = crypto.createHmac('sha256',
        process.env.AUTH_SECRET!,
    ).update(`${header}.${payload}`).digest('base64');

    if(newSignature !== signature){
        return;
    }

    return JSON.parse(atob(payload));
}