import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

test.describe('Homework1', () => {
    test.beforeEach()

    test('Пользователь может зарегаться используя емейл и пароль', async ({request}) => {
        const user = {
            user: {
                username: faker.internet.username(),
                email: faker.internet.email(),
                password: faker.internet.password(),
            }
        }

        // Response
        const response = await request.post(' https://realworld.qa.guru/api/users', {data: user});
        // Response body
        const body = await response.json();
        console.log(response.status());
        expect(response.status()).toBe(201);
        console.log(body);
        expect(body.user.token.length).toBeGreaterThan(15)
    })

})


