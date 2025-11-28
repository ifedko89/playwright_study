import { test, expect } from '@playwright/test';

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



