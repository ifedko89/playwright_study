import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

const apiUrl = "https://apichallenges.herokuapp.com";
let token;
let todoId;
let data;


test.describe('Homework1 - challenge', () => {
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

    test('create new task with long title', async ({request}) => {
        let invalidData = {...data, title: faker.string.alpha(51)};
        const postResponse = await request.post(`${apiUrl}/todos`, {
            headers: {
                'x-challenger': token
            },
            data: invalidData
        });
        const body = await postResponse.json();
        expect(postResponse.status()).toBe(400);
        expect(body.errorMessages[0]).toBe("Failed Validation: Maximum allowable length exceeded for title - maximum allowed is 50");

    })

    test('create new task with long description', async ({request}) => {
        let invalidData = {...data, description: faker.string.alpha(201)};
        const postResponse = await request.post(`${apiUrl}/todos`, {
            headers: {
                'x-challenger': token
            },
            data: invalidData
        });
        const body = await postResponse.json();
        expect(postResponse.status()).toBe(400);
        expect(body.errorMessages[0]).toBe("Failed Validation: Maximum allowable length exceeded for description - maximum allowed is 200");
    })

    test('create new task with extereme long description', async ({request}) => {
        let invalidData = {...data, description: faker.string.alpha(5555)};
        const postResponse = await request.post(`${apiUrl}/todos`, {
            headers: {
                'x-challenger': token
            },
            data: invalidData
        });
        const body = await postResponse.json();
        expect(postResponse.status()).toBe(413);
        expect(body.errorMessages[0]).toBe("Error: Request body too large, max allowed is 5000 bytes");
    })

    test('create new task with max title and description', async ({request}) => {
        let validData = {...data, title: faker.string.alpha(50), description: faker.string.alpha(200)};
        const postResponse = await request.post(`${apiUrl}/todos`, {
            headers: {
                'x-challenger': token
            },
            data: validData
        });
        const body = await postResponse.json();
        expect(postResponse.status()).toBe(201);
    })

    test('create new task with extra field', async ({request}) => {
        let invalidData = {...data, date: faker.date.anytime()};
        const postResponse = await request.post(`${apiUrl}/todos`, {
            headers: {
                'x-challenger': token
            },
            data: invalidData
        });
        const body = await postResponse.json();
        expect(postResponse.status()).toBe(400);
        expect(body.errorMessages[0]).toBe("Could not find field: date");

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

    test('update nonexistent task with PUT', async ({request}) => {
        const response = await request.put(`${apiUrl}/todos/09090909`, {
            headers: {
                'x-challenger': token
            },
            data: data
        });

        const body = await response.json();
        expect(response.status()).toBe(400);
        expect(body.errorMessages[0]).toBe("Cannot create todo with PUT due to Auto fields id");
    })

    test('update nonexistent task with POST', async ({request}) => {
        const response = await request.post(`${apiUrl}/todos/09090909`, {
            headers: {
                'x-challenger': token
            },
            data: data
        });

        const body = await response.json();
        expect(response.status()).toBe(404);
        expect(body.errorMessages[0]).toBe("No such todo entity instance with id == 09090909 found");
    })

    test('update task with POST', async ({request}) => {
        const postResponse = await request.post(`${apiUrl}/todos/${todoId}`, {
            headers: {
                'x-challenger': token
            },
            data: data
        });
        const body = await postResponse.json();
        expect(postResponse.status()).toBe(200);
        expect(body.title).toBe("title");
        expect(body.description).toBe("description");
        expect(body.doneStatus).toBe(true);

    })

})

