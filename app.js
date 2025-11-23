import fetchify from "./fetchify.js";

const httpClient = fetchify.create({
    baseURL: 'https://jsonplaceholder.typicode.com',
    timeout: 4500,
});

httpClient.addRequestInterceptor(config => {
    console.log('Request Interceptor:', config);
    return config;
}, error => {
    return Promise.reject(error);
});

httpClient.addResponseInterceptor(response => {
    console.log('Response Interceptor:', response);
    return response;
}, error => {
    return Promise.reject(error);
});

async function getTodos(params) {
    let response = await httpClient.get("/todos/1", {
        headers: { 'Authorization': 'Bearer token123' }
    });
    const todos = await response.json();
    console.log(todos);
}
getTodos();