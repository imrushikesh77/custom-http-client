class Fetchify {
    config = {
        timeout: 1000,
        headers: { 'Content-Type': 'application/json' }
    }
    requestInterceptors = [];
    responseInterceptors = [];

    constructor(config) {
        this.config = this.#mergeConfig(config);
    }

    async request(url, config) {
        const finalConfig = this.#mergeConfig(config);
        const promiseChain = [
            ...this.requestInterceptors,
            { successFn: this.dispatchRequest.bind(this), errorFn: undefined },
            ...this.responseInterceptors,
        ];

        let promise = Promise.resolve({ url, config: finalConfig });
        for (const { successFn, errorFn } of promiseChain) {
            promise = promise.then(
                (res) => {
                    try {
                        return successFn(res)
                    } catch (error) {
                        if (errorFn) {
                            errorFn(error);
                        } else {
                            return Promise.reject(error);
                        }
                    }
                },
                (err) => {
                    if (errorFn) {
                        return errorFn(err);
                    }
                    return Promise.reject(err);
                }
            );
        }
        return promise;
    }

    async dispatchRequest(config) {
        console.log("Dispatching request with config:", config);
        const abortController = new AbortController();

        const timeout = config?.timeout || this.config.timeout || 1000;
        let timeoutId;
        if (timeout) {
            timeoutId = setTimeout(() => {
                abortController.abort();
            }, timeout)
        }

        const requestConfig = this.#mergeConfig(config);
        const requestUrl = this.config.baseURL + config.url;

        try {
            const response = await fetch(requestUrl, {
                ...requestConfig,
                signal: abortController.signal,
            });

            return response;
        } finally {
            if (timeoutId) clearTimeout(timeoutId);
        }
    }

    async get(url, config) {
        return await this.request(url, config = { method: 'GET', ...config });
    }

    async post(url, config) {
        return await this.request(url, config = { method: 'POST', ...config });
    }

    #mergeConfig(config) {
        return {
            ...this.config,
            ...config,
            headers: {
                ...this.config.headers,
                ...config?.headers
            }
        }
    }

    addRequestInterceptor(successFn, errorFn) {
        this.requestInterceptors.push({ successFn, errorFn });
    }

    addResponseInterceptor(successFn, errorFn) {
        this.responseInterceptors.push({ successFn, errorFn });
    }
}
function create(config) {
    return new Fetchify(config);
}

export default { create };