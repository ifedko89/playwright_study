import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

const apiUrl = "https://apichallenges.herokuapp.com";
let token;
let todoId;
let data;


test.describe('Homework2 - challenge', () => {
    test.describe.configure({ mode: 'serial' });
    test.beforeAll( async ({request}) =>{
    const response = await request.post(`${apiUrl}/challenger`);
    const headers = await response.headers();
    token = headers['x-challenger'];
    //get task id
    let responseTodoID = await request.get(`${apiUrl}/todos`,{headers});
    const body = await responseTodoID.json();
    todoId = body.todos[0].id;
    data = { "doneStatus": true, "title": "title", "description": "description"};
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
        const response = await request.put(`${apiUrl}/todos/${todoId}`, {
            headers: {
                'x-challenger': token
            },
            data: data
        });
        expect(response.ok()).toBeTruthy();
        const statusResponse = await request.get(`${apiUrl}/todos?doneStatus=true`, {
            headers: {
                'x-challenger': token
            }
        });
        const statusBody = await statusResponse.json();
        expect(statusBody.todos[0].doneStatus).toBe(true);
    })

    test('check /todos headers', async ({request}) => {
        //request todos with ID
        const response = await request.head(`${apiUrl}/todos`, {
            headers: {
                'x-challenger': token
            }
        });
        const headers = await response.headers();
        expect(headers['x-challenger']).toBe(token);
        expect(headers['content-type']).toBe('application/json');
    })

    test('create new task', async ({request}) => {
        const postResponse = await request.post(`${apiUrl}/todos`, {
            headers: {
                'x-challenger': token
            },
            data: data
        });
        const body = await postResponse.json();
        expect(postResponse.status()).toBe(201);
        expect(body.title).toBe("title");
        expect(body.description).toBe("description");
        expect(body.doneStatus).toBe(true);

    })

    test('create new task with validation failed', async ({request}) => {
        let invalidData = {...data, doneStatus: 4};
        const postResponse = await request.post(`${apiUrl}/todos`, {
            headers: {
                'x-challenger': token
            },
            data: invalidData
        });
        expect(postResponse.status()).toBe(400);
    })

    test('delete existant task ', async ({request}) => {
        //Create new task
        const postResponse = await request.post(`${apiUrl}/todos`, {
            headers: {
                'x-challenger': token
            },
            data: data
        });
        const body = await postResponse.json();
        let newTaskId = body.id;
        expect(postResponse.status()).toBe(201);
//Delete new task
        const deleteResponse = await request.delete(`${apiUrl}/todos/${newTaskId}`, {
            headers: {
                'x-challenger': token
            }
        });
        //Check new task after delete
        const getResponse = await request.get(`${apiUrl}/todos/${newTaskId}`, {
            headers: {
                'x-challenger': token
            }
        });
        expect(getResponse.status()).toBe(404);

    })

})

