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

test('exibe mensagem quando a busca não encontra cidades', async ({ page }) => {
  let forecastRequests = 0;
  await page.route('https://geocoding-api.open-meteo.com/v1/search?*', async (route) => {
    expect(new URL(route.request().url()).searchParams.get('name')).toBe('Cidade inexistente');
    await route.fulfill({ json: { results: [] } });
  });
  await page.route('https://api.open-meteo.com/v1/forecast?*', async (route) => {
    forecastRequests += 1;
    await route.abort();
  });

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('Cidade inexistente');
  await page.getByRole('button', { name: 'Buscar' }).click();

  await expect(page.getByRole('heading', { name: 'Nenhuma cidade encontrada.' })).toBeVisible();
  expect(forecastRequests).toBe(0);
});

test('não envia busca vazia ou só com espaços', async ({ page }) => {
  let geocodingRequests = 0;
  await page.route('https://geocoding-api.open-meteo.com/v1/search?*', async (route) => {
    geocodingRequests += 1;
    await route.fulfill({ json: { results: [] } });
  });

  await page.goto('/');
  const input = page.getByRole('searchbox', { name: 'Cidade' });
  const submit = page.getByRole('button', { name: 'Buscar' });

  await submit.click();
  await expect(page.getByRole('alert')).toHaveText('Informe o nome de uma cidade.');
  await input.fill('   ');
  await submit.click();
  await expect(page.getByRole('alert')).toHaveText('Informe o nome de uma cidade.');
  await expect(input).toHaveValue('   ');
  expect(geocodingRequests).toBe(0);
});

test('trata caracteres especiais como texto literal na busca e no resultado', async ({ page }) => {
  const term = "L'Haÿ-les-Roses <img src=x onerror=alert(1)>";
  await page.route('https://geocoding-api.open-meteo.com/v1/search?*', async (route) => {
    expect(new URL(route.request().url()).searchParams.get('name')).toBe(term);
    await route.fulfill({
      json: {
        results: [{
          id: 2,
          name: term,
          country: 'France',
          latitude: 48.78,
          longitude: 2.34,
        }],
      },
    });
  });
  await page.route('https://api.open-meteo.com/v1/forecast?*', async (route) => {
    await route.fulfill({
      json: {
        timezone: 'Europe/Paris',
        current: { time: '2026-11-11T12:00', temperature_2m: 18 },
        daily: { time: ['2026-11-11', '2026-11-12', '2026-11-13', '2026-11-14', '2026-11-15'] },
      },
    });
  });

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Cidade' }).fill(term);
  await page.getByRole('button', { name: 'Buscar' }).click();

  const currentWeather = page.getByRole('region', { name: 'Condições atuais' });
  await expect(currentWeather.getByRole('heading', { name: term })).toBeVisible();
  await expect(page.locator('img[onerror]')).toHaveCount(0);
});

test('exibe fallbacks para forecast com campos e seção horária incompletos', async ({ page }) => {
  const dates = ['2026-11-11', '2026-11-12', '2026-11-13', '2026-11-14', '2026-11-15'];
  const hourlyTimes = Array.from({ length: 120 }, (_, index) =>
    new Date(Date.UTC(2026, 10, 11, 12 + index)).toISOString().slice(0, 16),
  );
  await page.route('https://geocoding-api.open-meteo.com/v1/search?*', async (route) => {
    await route.fulfill({
      json: {
        results: [{ id: 3, name: 'Paris', country: 'France', latitude: 48.85, longitude: 2.35 }],
      },
    });
  });
  await page.route('https://api.open-meteo.com/v1/forecast?*', async (route) => {
    await route.fulfill({
      json: {
        timezone: 'Europe/Paris',
        current: { time: '2026-11-11T12:00', temperature_2m: null, weather_code: null },
        daily: { time: dates, temperature_2m_min: [null, 1, 2, 3, 4] },
        hourly: { time: hourlyTimes },
      },
    });
  });

  await page.goto('/');
  await page.getByRole('searchbox', { name: 'Cidade' }).fill('Paris');
  await page.getByRole('button', { name: 'Buscar' }).click();

  const currentWeather = page.getByRole('region', { name: 'Condições atuais' });
  await expect(currentWeather.getByText('Dado indisponível').first()).toBeVisible();
  const forecast = page.getByRole('region', { name: 'Previsão para 5 dias' });
  await expect(forecast.getByText('Dado indisponível').first()).toBeVisible();
  const hourly = page.getByRole('region', { name: 'Previsão por hora' });
  await expect(hourly.getByRole('row')).toHaveCount(121);
  await expect(hourly.getByRole('row').nth(1)).toContainText('Dado indisponível');
  await expect(page.getByText(/NaN|undefined/)).toHaveCount(0);
});

test('mostra o clima após a busca em viewport mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
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
});