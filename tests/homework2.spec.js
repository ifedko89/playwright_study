import { test, expect } from '@playwright/test';

const apiUrl = "https://apichallenges.herokuapp.com";
let token;

test.describe('Homework2 - challenge', () => {
    test.describe.configure({ mode: 'serial' });
    test.beforeAll( async ({request}) =>{
    const response = await request.post(`${apiUrl}/challenger`);
    const headers = await response.headers();
    token = headers['x-challenger'];
    console.log(`https://apichallenges.herokuapp.com/gui/challenges/${token}`);
    });

    test('get challenges list', async ({request}) => {
        const response = await request.get(`${apiUrl}/challenges`, {
            headers: {
                'x-challenger': token
            }
        });
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body.challenges.length).toBe(59)
    })

    test('get todos list', async ({request}) => {
        const response = await request.get(`${apiUrl}/todos`, {
            headers: {
                'x-challenger': token
            }
        });
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body.todos.length).toBe(10)
    })

    test('get todo list - negative test', async ({request}) => {
        const response = await request.get(`${apiUrl}/todo`, {
            headers: {
                'x-challenger': token
            }
        });
        expect(response.status()).toBe(404);
    })

    test('get todo with id', async ({request}) => {
        //request first ID
        const responseFirst = await request.get(`${apiUrl}/todos`, {
            headers: {
                'x-challenger': token
            }
        });
        expect(responseFirst.status()).toBe(200);
        const body = await responseFirst.json();
        expect(body.todos.length).toBe(10);
        let todoId = body.todos[0].id;

        //request todos with ID
        const responseSecond = await request.get(`${apiUrl}/todos/${todoId}`, {
            headers: {
                'x-challenger': token
            }
        });
        const bodySecond = await responseSecond.json();
        expect(responseSecond.status()).toBe(200);
        expect(bodySecond.todos[0].id).toBe(todoId);
    })


    test('get todo with  unknown id', async ({request}) => {
        //request todos with ID
        const responseSecond = await request.get(`${apiUrl}/todos/909090909`, {
            headers: {
                'x-challenger': token
            }
        });
        expect(responseSecond.status()).toBe(404);

    })

    test('get todos list with filter', async ({request}) => {
        const response = await request.get(`${apiUrl}/todos?doneStatus=true`, {
            headers: {
                'x-challenger': token
            }
        });
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body.todos.length).toBe(0)
    })

})

