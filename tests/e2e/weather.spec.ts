import { expect, test as base, type Page } from '@playwright/test';

const test = base.extend<{ guardWeatherRequests: undefined }>({
  guardWeatherRequests: [async ({ page }, use) => {
    const unexpectedRequests: string[] = [];
    await page.route(/^https?:\/\/(?:[^/]+\.)?open-meteo\.com(?::\d+)?(?:\/|$)/, async (route) => {
      unexpectedRequests.push(route.request().url());
      await route.abort();
    });
    await page.clock.setFixedTime(new Date('2026-11-11T15:00:00Z'));
    await use(undefined);
    expect(unexpectedRequests).toEqual([]);
  }, { auto: true }],
});

async function mockWeatherRequests(page: Page) {
  await page.route('https://geocoding-api.open-meteo.com/v1/search?*', async (route) => {
    expect(new URL(route.request().url()).searchParams.get('name')).toBe('São Paulo');
    await route.fulfill({
      json: {
        results: [
          {
            id: 1,
            name: 'São Paulo',
            country: 'Brasil',
            admin1: 'São Paulo',
            latitude: -23.55,
            longitude: -46.63,
          },
        ],
      },
    });
  });

  await page.route('https://api.open-meteo.com/v1/forecast?*', async (route) => {
    const params = new URL(route.request().url()).searchParams;
    expect(params.get('latitude')).toBe('-23.55');
    expect(params.get('longitude')).toBe('-46.63');
    await route.fulfill({
      json: {
        timezone: 'America/Sao_Paulo',
        current: { time: '2026-11-11T12:00', temperature_2m: 0, weather_code: 0 },
        daily: {
          time: ['2026-11-11', '2026-11-12', '2026-11-13', '2026-11-14', '2026-11-15'],
          temperature_2m_min: [1, 2, 3, 4, 5],
          temperature_2m_max: [11, 12, 13, 14, 15],
          weather_code: [0, 1, 2, 3, 45],
        },
      },
    });
  });
}

test('busca uma cidade e converte a temperatura para Fahrenheit', async ({ page }) => {
  await mockWeatherRequests(page);
  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('São Paulo');
  await page.getByRole('button', { name: 'Buscar' }).click();

  const currentWeather = page.getByRole('region', { name: 'Condições atuais' });
  await expect(currentWeather.getByRole('heading', { name: 'São Paulo' })).toBeVisible();
  await expect(currentWeather.getByText('0 °C', { exact: true })).toBeVisible();

  const forecast = page.getByRole('region', { name: 'Previsão para 5 dias' });
  await expect(forecast).toBeVisible();
  await expect(forecast.getByRole('article')).toHaveCount(5);

  await page.getByRole('button', { name: '°F' }).click();
  await expect(currentWeather.getByText('32 °F', { exact: true })).toBeVisible();
});