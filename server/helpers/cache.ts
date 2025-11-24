import { json } from 'itty-router';
export async function cachedFetch(env: Env, ...args: Parameters<typeof fetch>): Promise<Response> {


    // @ts-ignore
    const url = env.VITE_CACHE_BASE_URL + encodeURIComponent(args[0].toString());
    // @ts-ignore
    let response = await caches.default.match(url);

    if (response) {

        return response;
    }

    response = await fetch(args[0], args[1]);

    if (response.ok) {
        // caches.default successful responses for 24 hours
        const responseClone = response.clone();
        // @ts-ignore
        await caches.default.put(url, responseClone)

    }

    return response
}


export const getCachedJson = async (env: Env, reference: string, defaultValue: any = undefined): Promise<any> => {

    // @ts-ignore
    const url = env.VITE_CACHE_BASE_URL + btoa(reference);

    // @ts-ignore
    let response = await caches.default.match(url);

    if (response) {

        return response.json()
    }


    return defaultValue;

}

export const setCachedJson = async (env: Env, reference: string, data: any, {
    expirationTTL } = { expirationTTL: 300 }): Promise<void> => {

    // @ts-ignore
    const url = env.VITE_CACHE_BASE_URL + btoa(reference);


    const response = json(data)


    // @ts-ignore
    await caches.default.put(url, response, {
        expirationTtl: expirationTTL
    });
}