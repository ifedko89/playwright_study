import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

const apiUrl = 'https://realworld.qa.guru';
let json =
    test('Неавторизованный может получить список статей', async ({ request }) => {
        const response = await request.get('https://realworld.qa.guru/api/articles');
        console.log(response);
        expect(response.status()).toBe(200);
    });

test('Неавторизованный может получить список статей c пагинацией', async ({ request }) => {
    const response = await request.get('https://realworld.qa.guru/api/articles?limit=30&offset=0');
    expect(response.status()).toBe(200);
});

test('Неавторизованный может получить список статей c пагинацией, проверка содержимого ответа', async ({ request }) => {
    // Response
    const response = await request.get('https://realworld.qa.guru/api/articles?limit=30&offset=0');
    // Response body
    const body = await response.json();
    console.log(response.status());
    expect(response.status()).toBe(200);
    expect(await body.articlesCount).toBeGreaterThan(23000);
});


test('Пользователь может зарегаться используя емейл и пароль', async ({ request }) => {
    const user = {
        user: {
            username: faker.internet.username(),
            email: faker.internet.email(),
            password: faker.internet.password(),
        }
    }

    const fakeUser = {
            username: faker.internet.username(),
            email: faker.internet.email(),
            password: faker.internet.password(),
    }
    
    const {email, username, password} = fakeUser;

        // Response
        const response = await request.post(' https://realworld.qa.guru/api/users', {data: user});
        // Response body
    const body = await response.json();
    console.log(response.status());
    expect(response.status()).toBe(201);
    console.log(body);
    expect(body.user.token.length).toBeGreaterThan(15)
   ///     https://realworld.qa.guru/api/users

     //       {"user":{"username":"sni","email":"sniper2211205@ya.ru","password":"123456788"}}


})


