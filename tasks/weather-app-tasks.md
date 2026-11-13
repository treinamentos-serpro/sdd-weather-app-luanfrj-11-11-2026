# Backlog de Tarefas — Aplicação de Previsão do Tempo

Backlog derivado de [plans/weather-app-plan.md](../plans/weather-app-plan.md) e rastreável à especificação. As tarefas estão agrupadas por entrega e ordenadas por dependência; os IDs originais são preservados como referências estáveis e, por isso, não necessariamente aparecem em ordem numérica. Foram separadas quando atravessavam responsabilidades ou exigiam alterações em mais de dois arquivos relevantes.

## Prioridade e tamanho

Prioridade indica ordem de entrega, não opcionalidade: **P0** viabiliza a primeira consulta ponta a ponta; **P1** completa os requisitos essenciais e a validação de qualidade; **P2** cobre medições operacionais e gates finais de lançamento. Tarefas P1 e P2 continuam necessárias antes da publicação. Tamanho é relativo ao esforço: **P** pequeno e isolado, **M** esforço moderado, **G** envolve múltiplas integrações ou validação complexa.

| Prioridade | Tamanho | Tarefas |
| --- | --- | --- |
| P0 | P | T-01, T-02, T-51, T-52 |
| P0 | M | T-03, T-04, T-08, T-10, T-11, T-13, T-14, T-15, T-23, T-24, T-25, T-26 |
| P0 | G | T-09, T-12, T-16, T-17 |
| P1 | P | T-05, T-06, T-07, T-21, T-38 |
| P1 | M | T-20, T-22, T-27, T-28, T-29, T-30, T-32, T-34, T-35, T-36, T-37, T-45, T-46, T-47, T-49, T-50 |
| P1 | G | T-18, T-19, T-31, T-33 |
| P2 | M | T-39, T-42, T-44, T-48 |
| P2 | G | T-40, T-41, T-43 |

## Sequência sugerida em fatias verticais

1. **Consulta atual visível:** T-01, T-51 e T-52 permitem desenvolver a UI com dados locais; seguir com T-02 a T-04, T-08, T-09, T-12, T-14 a T-17 e T-23. Ao concluir T-23, já é possível buscar uma cidade e ver suas condições atuais; validar com T-06, T-07, T-10, T-11, T-13 e T-24 a T-26.
2. **Previsão e unidade:** T-05, T-18 a T-20 e T-49; validar com T-27 a T-29. A experiência passa a cobrir os cinco dias e a troca Celsius/Fahrenheit.
3. **Identidade e transparência:** iniciar T-46 em paralelo desde a primeira fatia, pois depende do patrocinador; depois concluir T-21, T-22 e T-50, validando com T-30. Essa fatia fecha atribuição, aviso de estimativa e marca aprovada.
4. **Robustez e lançamento:** T-31 a T-38, depois T-39 a T-44 e T-48. Iniciar T-45 e T-47 em paralelo desde cedo, pois aprovações externas podem bloquear a publicação.

As fatias são incrementais: cada uma amplia o aplicativo integrado, sem esperar a conclusão de todos os componentes para obter o primeiro resultado visível. P2 e as aprovações de T-45 a T-47 não são dispensáveis para lançamento.

## Entrega 1 — Tipos do domínio

### T-01 — Definir contratos meteorológicos
- **Tipo:** Data
- **Descrição:** Criar os tipos compartilhados de cidade, unidade, condições atuais, previsões e estado dos dados.
- **Critérios de aceite:** `src/types/weather.ts` compila com TypeScript strict e exporta `TemperatureUnit`, `City`, `CurrentConditions`, `DailyForecast`, `HourlyForecast` e `WeatherData`; também exporta `Unit`, `CurrentWeather` e `ForecastDay` como aliases dos respectivos tipos `TemperatureUnit`, `CurrentConditions` e `DailyForecast`; cada campo descrito no modelo de dados do plano tem propriedade tipada; dados meteorológicos ausentes aceitam `null`, e temperaturas permanecem em Celsius sem arredondamento.
- **Dependências:** —
- **Arquivos prováveis:** `src/types/weather.ts`

### T-51 — Criar mock meteorológico para desenvolver a UI
- **Tipo:** Data
- **Descrição:** Exportar um objeto estático de exemplo compatível com `WeatherData`, sem acesso à API.
- **Critérios de aceite:** O objeto exportado compila com TypeScript strict e contém uma cidade identificada, fuso IANA, condições atuais preenchidas e cinco dias locais consecutivos em ordem, com todos os campos diários do plano; inclui 120 registros horários consecutivos a partir da hora cheia da leitura atual do exemplo, com os campos horários preenchidos; temperaturas são valores em Celsius sem arredondamento. Importar o objeto não executa requisições nem depende do relógio ou da rede.
- **Dependências:** T-01
- **Arquivos prováveis:** `src/mocks/weather.ts`

### T-52 — Testar o mock meteorológico
- **Tipo:** Test
- **Descrição:** Verificar a estrutura e a consistência temporal do objeto usado no desenvolvimento da UI.
- **Critérios de aceite:** Teste automatizado confirma cidade, fuso e condições atuais presentes, cinco datas locais consecutivas em ordem e 120 horários consecutivos a partir da hora cheia da leitura atual do exemplo; verifica que os campos atuais, diários e horários estão preenchidos e que a importação não chama `fetch`. A checagem de tipos confirma que o mock satisfaz `WeatherData`.
- **Dependências:** T-01, T-51
- **Arquivos prováveis:** `tests/unit/weatherMock.test.ts`

## Entrega 2 — Funções puras

### T-02 — Implementar conversão e arredondamento de temperatura
- **Tipo:** Data
- **Descrição:** Criar funções puras para conversão entre Celsius e Fahrenheit e arredondamento da temperatura exibida.
- **Critérios de aceite:** Conversão usa o valor original; `0 °C` resulta em `32 °F`, `100 °C` em `212 °F`, `-40 °C` em `-40 °F` e `21,6 °C` em `71 °F`; meias unidades arredondam para longe de zero.
- **Dependências:** T-01
- **Arquivos prováveis:** `src/lib/temperature.ts`

### T-03 — Implementar formatação de datas e horários
- **Tipo:** Data
- **Descrição:** Criar funções puras de formatação que recebem o fuso IANA da cidade.
- **Critérios de aceite:** Datas aparecem em `dd/mm/aaaa` e horários em `HH:mm`; para o instante `2026-01-01T01:00:00Z`, o fuso `America/Sao_Paulo` produz `31/12/2025 22:00` e `UTC` produz `01/01/2026 01:00`, independentemente do fuso do executor.
- **Dependências:** T-01
- **Arquivos prováveis:** `src/lib/dateTime.ts`

### T-04 — Mapear códigos meteorológicos WMO
- **Tipo:** Data
- **Descrição:** Mapear códigos de tempo para descrição em pt-BR e identificador de ícone.
- **Critérios de aceite:** A tabela contém os códigos WMO `0, 1, 2, 3, 45, 48, 51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 71, 73, 75, 77, 80, 81, 82, 85, 86, 95, 96, 99`, cada qual com descrição pt-BR não vazia e identificador de ícone; `null` e qualquer código fora da tabela retornam o mesmo fallback documentado sem lançar erro.
- **Dependências:** T-01
- **Arquivos prováveis:** `src/lib/weatherCodes.ts`

## Entrega 3 — Services

### T-08 — Implementar serviço de geocodificação
- **Tipo:** Data
- **Descrição:** Implementar `searchCities` com validação local e mapeamento de resultados para `City`.
- **Critérios de aceite:** Termos aparados com 0 ou 1 caractere e com mais de 100 caracteres não chamam `fetch`; para termo válido, a URL contém `count=10`, `language=pt` e `format=json`; acentos, hífens, apóstrofos e espaços internos sobrevivem à codificação/decodificação da query; os dez primeiros resultados mantêm a ordem e mapeiam `id`, `name`, `country`, `admin1` para região e coordenadas; resultado ausente ou vazio retorna lista vazia; HTTP não-2xx resulta em erro `api`, JSON incompatível em `invalid-response`, falha de rede em `network` e timeout aos 5 s em `timeout`; cada falha gera somente uma chamada.
- **Dependências:** T-01
- **Arquivos prováveis:** `src/services/geocodingService.ts`

### T-09 — Implementar serviço de previsão meteorológica
- **Tipo:** Data
- **Descrição:** Implementar `getWeather` e mapear a resposta Forecast aos contratos internos.
- **Critérios de aceite:** A URL contém exatamente as listas de variáveis `current`, `daily` e `hourly` definidas no plano, `timezone=auto`, `temperature_unit=celsius`, `wind_speed_unit=kmh`, `precipitation_unit=mm` e `forecast_days=6`; cada índice dos arrays é mapeado ao mesmo registro; visibilidade em metros é dividida por 1000; campo ausente vira `null`; dados diários retornam os cinco primeiros dias locais e dados horários exatamente 120 timestamps consecutivos a partir da hora cheia local; seção válida permanece disponível se outra estiver incompleta; HTTP não-2xx resulta em erro `api`, JSON incompatível em `invalid-response`, falha de rede em `network` e timeout aos 5 s em `timeout`; não há segunda chamada automática.
- **Dependências:** T-01, T-03
- **Arquivos prováveis:** `src/services/weatherService.ts`

## Entrega 4 — Hook e estado

### T-12 — Implementar o hook `useWeather`
- **Tipo:** Data
- **Descrição:** Coordenar busca, seleção, consulta meteorológica, retry e unidade em estados separados.
- **Critérios de aceite:** Estado inicial tem busca e clima `idle`, cidade `null` e unidade `celsius`; busca percorre `idle → loading → success|empty|error` e clima `idle → loading → success|error`; selecionar uma cidade limpa o clima no mesmo evento e mantém a cidade selecionada após falha; retry reutiliza exatamente o termo ou objeto `City`; alternar unidade não chama serviço; em duas operações resolvidas fora de ordem, somente a de sequência mais recente altera resultados/clima.
- **Dependências:** T-08, T-09
- **Arquivos prováveis:** `src/hooks/useWeather.ts`

## Entrega 5 — Componentes de interface

### T-14 — Criar formulário de busca
- **Tipo:** UI
- **Descrição:** Implementar o campo e o envio explícito da busca por botão ou Enter.
- **Critérios de aceite:** Com mock do serviço, digitar não chama busca; Enter e botão “Buscar” chamam uma vez cada; o valor do input nunca excede 100 caracteres; campo vazio/só espaços mostra “Informe o nome de uma cidade.” e não chama o serviço; termo aparado de 1 caractere mostra “Digite pelo menos 2 caracteres.” e não chama o serviço; controle tem label acessível e pode ser usado por teclado.
- **Dependências:** T-12
- **Arquivos prováveis:** `src/components/SearchForm.tsx`

### T-15 — Criar lista de resultados de cidades
- **Tipo:** UI
- **Descrição:** Exibir resultados selecionáveis e identificáveis, inclusive cidades homônimas.
- **Critérios de aceite:** Enter e Espaço selecionam a opção focada; nome, região e país distintos aparecem no rótulo; sem região, o rótulo inclui país e coordenadas; quando nome, país e região são iguais, coordenadas são exibidas com exatamente quatro casas decimais e tornam os rótulos distintos.
- **Dependências:** T-01, T-12
- **Arquivos prováveis:** `src/components/CityResults.tsx`

### T-16 — Criar mensagens de estado e recuperação
- **Tipo:** UI
- **Descrição:** Exibir estado inicial, carregamento, vazio, falhas e ações de retry.
- **Critérios de aceite:** Estado inicial mostra “Informe o nome de uma cidade para ver o clima.”; loading mostra “Carregando…” e não mostra mensagem de vazio antes da resposta; resultado vazio mostra “Nenhuma cidade encontrada. Confira a grafia e tente novamente.”; falha de clima e falha de busca mostram os textos literais de AC-06.3 e AC-06.7; timeout mostra o texto de EC-06; retry repete uma vez, preserva a entrada e fica desabilitado até a resposta; erro usa `role=alert`, alterações usam região live sem mover foco; com `prefers-reduced-motion: reduce` o indicador não anima continuamente. A divergência entre AC-06.7 e EC-06 sobre o texto de timeout de busca deve ter decisão registrada e teste literal antes do fechamento da tarefa.
- **Dependências:** T-12
- **Arquivos prováveis:** `src/components/StatusMessage.tsx`

### T-17 — Exibir condições atuais
- **Tipo:** UI
- **Descrição:** Apresentar identificação da cidade, leitura atual e variáveis meteorológicas disponíveis.
- **Critérios de aceite:** Com fixture completa, são renderizados temperatura, sensação térmica, umidade (%), ponto de orvalho, pressão (hPa), velocidade/direção do vento, rajadas (km/h), precipitação (mm), cobertura de nuvens (%), UV, visibilidade (km) e descrição/ícone; data `dd/mm/aaaa` e hora `HH:mm` correspondem ao fuso IANA da cidade; leitura com mais de 60 minutos exibe o texto literal de AC-03.3; cada campo `null` exibe “Dado indisponível” no lugar do valor, nunca `0`.
- **Dependências:** T-01, T-02, T-03, T-04, T-12
- **Arquivos prováveis:** `src/components/CurrentConditions.tsx`

### T-18 — Exibir previsão diária
- **Tipo:** UI
- **Descrição:** Apresentar cinco dias locais e os campos diários disponíveis.
- **Critérios de aceite:** Fixture de seis dias renderiza exatamente os cinco primeiros, consecutivos e em ordem; cada dia mostra mínima/máxima com símbolo da unidade, descrição/ícone, probabilidade máxima (%), soma de precipitação (mm), velocidade/rajadas máximas (km/h), direção dominante, UV máximo, nascer e pôr do sol quando não nulos; cada valor `null` mostra “Dado indisponível” sem remover os demais campos ou dias.
- **Dependências:** T-01, T-02, T-03, T-04, T-12
- **Arquivos prováveis:** `src/components/DailyForecast.tsx`

### T-19 — Exibir previsão horária
- **Tipo:** UI
- **Descrição:** Apresentar as 120 horas da previsão no fuso local da cidade.
- **Critérios de aceite:** Fixture com 120 timestamps consecutivos produz exatamente 120 itens, começando na hora cheia local; cada item mostra data `dd/mm/aaaa`, hora `HH:mm`, temperatura e símbolo ativo, probabilidade (%), precipitação (mm), velocidade do vento (km/h) e descrição/ícone quando não nulos; todo valor `null` mostra “Dado indisponível”.
- **Dependências:** T-01, T-02, T-03, T-04, T-12
- **Arquivos prováveis:** `src/components/HourlyForecast.tsx`

### T-20 — Criar alternador de unidade
- **Tipo:** UI
- **Descrição:** Permitir alternar entre Celsius e Fahrenheit durante a sessão.
- **Critérios de aceite:** Nome acessível é exatamente “Unidade de temperatura”; ambas as opções podem ser selecionadas por teclado e o estado selecionado é exposto semanticamente; ao alternar, todas as temperaturas atuais/diárias/horárias e seus símbolos mudam sem incremento no contador de requests; em loading/erro sem temperaturas, alternar muda apenas a unidade; unidade inicial é Celsius e não persiste após recarregar.
- **Dependências:** T-02, T-12
- **Arquivos prováveis:** `src/components/UnitToggle.tsx`

### T-21 — Criar componente de atribuição meteorológica
- **Tipo:** UI
- **Descrição:** Exibir a atribuição Open-Meteo e o link oficial da licença.
- **Critérios de aceite:** A tela renderiza literalmente “Dados meteorológicos: Open-Meteo” e link “Licença CC BY 4.0” cujo `href` é `https://creativecommons.org/licenses/by/4.0/`; o link recebe foco e abre por teclado.
- **Dependências:** T-12
- **Arquivos prováveis:** `src/components/Attribution.tsx`

### T-46 — Aprovar marca e logotipo SERPRO
- **Tipo:** Infra
- **Descrição:** Obter o material oficial e autorização de uso conforme diretrizes da marca.
- **Critérios de aceite:** O arquivo incorporado é o material oficial fornecido e `docs/release-readiness.md` contém autorização datada do patrocinador; sem ambos, o gate permanece bloqueado.
- **Dependências:** —
- **Arquivos prováveis:** `src/assets/serpro-logo.*`, `docs/release-readiness.md`

### T-22 — Criar cabeçalho com a marca SERPRO
- **Tipo:** UI
- **Descrição:** Exibir o logotipo oficial fornecido pelo patrocinador em todos os estados da página.
- **Critérios de aceite:** Elemento de imagem tem `alt="SERPRO"` e usa o arquivo autorizado pelo patrocinador; teste de renderização nos estados inicial, loading, resultados, vazio e erro encontra exatamente um logotipo visível no cabeçalho.
- **Dependências:** T-12, T-46
- **Arquivos prováveis:** `src/components/BrandHeader.tsx`, `src/assets/serpro-logo.*`

## Entrega 6 — Integração

### T-23 — Integrar busca e condições atuais no aplicativo
- **Tipo:** UI
- **Descrição:** Compor no `App` a primeira jornada completa: busca, seleção, estados e condições atuais.
- **Critérios de aceite:** Renderização inicial e testes de integração comprovam que busca e seleção chamam as ações do hook e que os dados da cidade selecionada chegam ao componente de condições atuais; estados inicial, loading, vazio e erro são exibidos sem ocultar o formulário; é possível concluir uma consulta e ver as condições atuais.
- **Dependências:** T-12, T-14, T-15, T-16, T-17
- **Arquivos prováveis:** `src/App.tsx`

### T-49 — Integrar previsão diária, horária e unidade
- **Tipo:** UI
- **Descrição:** Acrescentar ao `App` as duas previsões, o alternador de temperatura e o aviso de estimativa.
- **Critérios de aceite:** Com uma cidade selecionada, o `App` exibe previsões diária e horária, alterna todas as temperaturas entre Celsius e Fahrenheit sem nova consulta e mostra junto à previsão o aviso literal de AC-07.2.
- **Dependências:** T-18, T-19, T-20, T-23
- **Arquivos prováveis:** `src/App.tsx`

### T-50 — Integrar marca e atribuição ao aplicativo
- **Tipo:** UI
- **Descrição:** Incorporar cabeçalho SERPRO e atribuição Open-Meteo ao layout integrado.
- **Critérios de aceite:** Marca autorizada e atribuição com link oficial aparecem em todos os estados da página; inspeção do DOM e das requisições não encontra publicidade nem scripts de publicidade/rastreamento.
- **Dependências:** T-21, T-22, T-23, T-49
- **Arquivos prováveis:** `src/App.tsx`

## Entrega 7 — Testes

### T-05 — Testes unitários da conversão Celsius/Fahrenheit
- **Tipo:** Test
- **Descrição:** Criar testes unitários isolados para conversão de unidade e arredondamento, sem React ou chamadas de rede.
- **Critérios de aceite:** Testes verificam `0 °C → 32 °F`, `100 °C → 212 °F`, `-40 °C → -40 °F`, `21,6 °C → 71 °F`, conversão inversa de `32 °F → 0 °C` e arredondamento de `2,5 → 3` e `-2,5 → -3`; nenhuma chamada a `fetch` ocorre.
- **Dependências:** T-02, T-23
- **Arquivos prováveis:** `tests/unit/temperature.test.ts`

### T-06 — Testar formatação temporal por fuso
- **Tipo:** Test
- **Descrição:** Cobrir formatação de data e hora em fusos IANA diferentes do fuso do executor.
- **Critérios de aceite:** Testes fixam o instante `2026-01-01T01:00:00Z` nos fusos `America/Sao_Paulo` e `UTC` e esperam, respectivamente, `31/12/2025 22:00` e `01/01/2026 01:00`; outro caso confirma formatação `HH:mm` em horário local próximo à meia-noite.
- **Dependências:** T-03, T-23
- **Arquivos prováveis:** `tests/unit/dateTime.test.ts`

### T-07 — Testar mapeamento de códigos WMO
- **Tipo:** Test
- **Descrição:** Verificar códigos meteorológicos conhecidos e o fallback.
- **Critérios de aceite:** Há uma asserção para cada código WMO listado em T-04, validando descrição não vazia e identificador de ícone; há asserções para `null` e código desconhecido validando o fallback exato.
- **Dependências:** T-04, T-23
- **Arquivos prováveis:** `tests/unit/weatherCodes.test.ts`

### T-10 — Testar serviço de geocodificação
- **Tipo:** Test
- **Descrição:** Criar testes unitários do serviço de geocodificação substituindo `fetch` por mock.
- **Critérios de aceite:** Todos os casos usam `fetch` mockado e nenhum request real; verificam zero chamadas para termos de 0, 1 e 101 caracteres, parâmetros de query, dez resultados em ordem, mapeamento de região/coordenadas, lista ausente/vazia e classificação de HTTP, JSON inválido, rede e timeout; cada cenário de falha resulta em exatamente uma chamada.
- **Dependências:** T-08, T-23
- **Arquivos prováveis:** `tests/unit/geocodingService.test.ts`

### T-11 — Testar serviço de previsão meteorológica
- **Tipo:** Test
- **Descrição:** Criar testes unitários do serviço Forecast substituindo `fetch` por mock e usando fixtures determinísticas.
- **Critérios de aceite:** Todos os casos usam `fetch` mockado e nenhum request real; verificam query e mapeamento, visibilidade `24000 → 24`, campos ausentes como `null`, cinco itens diários, 120 horários, slots de arrays desalinhados e preservação de seções válidas diante de parciais; HTTP não-2xx, JSON inválido, falha de rede e timeout aos 5 s são rejeitados/classificados conforme o contrato.
- **Dependências:** T-09, T-23
- **Arquivos prováveis:** `tests/unit/weatherService.test.ts`, `tests/fixtures/weather-response.ts`

### T-13 — Testar estados e concorrência do hook
- **Tipo:** Test
- **Descrição:** Validar o hook com serviços simulados.
- **Critérios de aceite:** Testes de hook verificam estado inicial exato; cada transição `loading/success/empty/error`; retry com termo e cidade originais; clima anterior removido imediatamente após seleção; contador de chamadas inalterado ao alternar unidade; duas promises resolvidas em ordem inversa deixam no estado somente o resultado da segunda operação.
- **Dependências:** T-12, T-23
- **Arquivos prováveis:** `tests/components/useWeather.test.ts`

### T-24 — Testar formulário e resultados de busca
- **Tipo:** Test
- **Descrição:** Cobrir validação local, envio e seleção de cidade com Testing Library.
- **Critérios de aceite:** Testes automatizados verificam: zero requests durante digitação; um request ao Enter e um ao botão; valor máximo de 100 caracteres; textos exatos para vazio e termo de 1 caractere; Enter e Espaço selecionam opção focada; fixture de homônimos produz rótulos distintos conforme AC-02.2.
- **Dependências:** T-14, T-15, T-23
- **Arquivos prováveis:** `tests/components/search.test.tsx`

### T-25 — Testar estados de loading, erro e vazio nos componentes
- **Tipo:** Test
- **Descrição:** Criar testes de componente com Testing Library para os estados inicial, loading, vazio e erro e suas ações de recuperação.
- **Critérios de aceite:** Testes renderizam separadamente estado inicial, loading, vazio, erro de busca e erro de clima; comparam os textos literais definidos em T-16; verificam `role=alert` para erro, região live para atualização, foco inalterado após atualização e retry desabilitado enquanto pendente; sob `prefers-reduced-motion: reduce`, loading não anima continuamente.
- **Dependências:** T-16, T-23
- **Arquivos prováveis:** `tests/components/StatusMessage.test.tsx`

### T-26 — Testar condições atuais
- **Tipo:** Test
- **Descrição:** Verificar renderização de condições e dados ausentes.
- **Critérios de aceite:** Com fixture completa, testes encontram cada campo e unidade listados em AC-03.4, descrição/ícone e data/hora local; fixture >60 min mostra o texto de AC-03.3; fixture com cada campo `null` mostra “Dado indisponível” e não renderiza `0` como substituto.
- **Dependências:** T-17, T-23
- **Arquivos prováveis:** `tests/components/CurrentConditions.test.tsx`

### T-27 — Testar previsão diária
- **Tipo:** Test
- **Descrição:** Verificar quantidade, ordem e conteúdo da previsão diária.
- **Critérios de aceite:** Fixture de seis dias rende cinco itens na ordem; para cada item, testes verificam mínima/máxima com unidade ativa, todas as variáveis de AC-04.3, ícone/descrição e fallback “Dado indisponível” para cada campo nulo, sem suprimir outros dados válidos.
- **Dependências:** T-18, T-49
- **Arquivos prováveis:** `tests/components/DailyForecast.test.tsx`

### T-28 — Testar previsão horária
- **Tipo:** Test
- **Descrição:** Verificar sequência horária, formatação local e dados exibidos.
- **Critérios de aceite:** Fixture gera exatamente 120 itens consecutivos; asserts verificam primeiro e último timestamp, data/hora no fuso selecionado, todas as variáveis de AC-04.4, unidade ativa e “Dado indisponível” para cada campo nulo.
- **Dependências:** T-19, T-49
- **Arquivos prováveis:** `tests/components/HourlyForecast.test.tsx`

### T-29 — Testar alternador de unidade
- **Tipo:** Test
- **Descrição:** Verificar acessibilidade e interação do controle Celsius/Fahrenheit.
- **Critérios de aceite:** Testes verificam nome acessível literal, seleção das duas opções por teclado, estado ativo acessível, Celsius inicial, conversões de 0/100 °C e -40/21,6 °C conforme AC-05.1/.4, zero requests extras e nenhuma temperatura renderizada quando dado está ausente.
- **Dependências:** T-20, T-49
- **Arquivos prováveis:** `tests/components/UnitToggle.test.tsx`

### T-30 — Testar integração visual do aplicativo
- **Tipo:** Test
- **Descrição:** Verificar a composição de marca, atribuição, aviso e estado inicial no `App`.
- **Critérios de aceite:** Testes confirmam estado inicial literal, cabeçalho SERPRO com `alt="SERPRO"`, atribuição com `href` oficial, aviso literal de estimativa junto à previsão e que marca/campo de busca permanecem no DOM em loading, sucesso, vazio e erro.
- **Dependências:** T-50
- **Arquivos prováveis:** `tests/components/App.test.tsx`

### T-31 — Testar jornada principal com Playwright
- **Tipo:** Test
- **Descrição:** Percorrer a jornada principal em desktop e viewport mobile com endpoints interceptados e dados determinísticos.
- **Critérios de aceite:** Playwright executa busca, seleção, condições atuais, previsões e alternância de unidade em desktop e em viewport mobile de 320 px; em ambos os viewports confirma os dados da cidade selecionada, ausência de rolagem horizontal e nenhuma nova request ao alternar unidade.
- **Dependências:** T-23, T-49, T-50
- **Arquivos prováveis:** `tests/e2e/weather-flow.spec.ts`

### T-32 — Testar casos-limite de busca com Playwright
- **Tipo:** Test
- **Descrição:** Cobrir resultado vazio e distinção de cidades homônimas no navegador.
- **Critérios de aceite:** E2E verifica mensagem de busca sem resultados, ausência de chamada meteorológica nesse caso e seleção inequívoca entre homônimos.
- **Dependências:** T-23
- **Arquivos prováveis:** `tests/e2e/search-edge-cases.spec.ts`

### T-33 — Testar falhas meteorológicas e concorrência com Playwright
- **Tipo:** Test
- **Descrição:** Cobrir recuperação de falha e proteção contra respostas obsoletas.
- **Critérios de aceite:** E2E verifica falha, timeout, retry manual, troca de cidade e resposta fora de ordem; a tela mantém a cidade mais recente e não repete requests automaticamente.
- **Dependências:** T-23
- **Arquivos prováveis:** `tests/e2e/weather-resilience.spec.ts`

## Entrega 8 — Hardening e validação

### T-34 — Verificar responsividade com Playwright
- **Tipo:** Test
- **Descrição:** Validar os fluxos essenciais em viewport móvel e zoom ampliado.
- **Critérios de aceite:** Em 320 px na orientação retrato e paisagem, `scrollWidth` não excede `clientWidth`; com zoom de 200% não há rolagem horizontal e controles permanecem acessíveis; cada controle de toque principal mede pelo menos 44 × 44 CSS px.
- **Dependências:** T-31
- **Arquivos prováveis:** `tests/e2e/responsive.spec.ts`

### T-35 — Verificar segurança e privacidade no navegador
- **Tipo:** Test
- **Descrição:** Confirmar tratamento seguro de conteúdo externo e ausência de rastreamento ou armazenamento de terceiros.
- **Critérios de aceite:** Payload de teste com marcação é exibido como texto e não cria elemento executável; lista de requests do navegador contém somente a aplicação e endpoints Open-Meteo aprovados, sem domínios de anúncios/trackers; após o fluxo, não há cookies ou armazenamento local/session de terceiros, nem preferência persistida pela aplicação.
- **Dependências:** T-50
- **Arquivos prováveis:** `tests/e2e/privacy-security.spec.ts`

### T-36 — Executar auditoria automatizada de acessibilidade
- **Tipo:** Test
- **Descrição:** Integrar auditoria automatizada WCAG 2.1 AA aos fluxos relevantes.
- **Critérios de aceite:** A execução da ferramenta automatizada termina com zero violações WCAG 2.1 AA nas telas de busca, resultados, carregamento, vazio, erro, condições atuais e previsões; versão/configuração da ferramenta e relatório são anexados ao registro.
- **Dependências:** T-23
- **Arquivos prováveis:** `tests/e2e/accessibility.spec.ts`

### T-37 — Registrar verificação manual de acessibilidade
- **Tipo:** Test
- **Descrição:** Validar fluxo por teclado e leitores de tela desktop e móvel.
- **Critérios de aceite:** Registro identifica sistema, navegador e leitor de tela desktop e móvel; marca busca, seleção, consulta e alternância como concluídas apenas quando operáveis sem mouse, com foco visível, anúncios de atualização/erro e comportamento sem animação contínua sob movimento reduzido; falhas ficam listadas com estado pendente.
- **Dependências:** T-23, T-36
- **Arquivos prováveis:** `docs/accessibility-validation.md`

### T-38 — Executar gates de lint, build e testes
- **Tipo:** Test
- **Descrição:** Executar os comandos de validação requeridos pelo projeto.
- **Critérios de aceite:** Em ambiente documentado, `pnpm lint`, `pnpm build` e `pnpm test` terminam cada um com código de saída `0`; saída e commit testado são registrados.
- **Dependências:** T-05, T-06, T-07, T-10, T-11, T-13, T-24, T-25, T-26, T-27, T-28, T-29, T-30, T-31, T-32, T-33, T-34, T-35, T-36, T-37
- **Arquivos prováveis:** `package.json`

### T-39 — Verificar orçamento de transferência
- **Tipo:** Test
- **Descrição:** Medir o tamanho comprimido da página inicial de produção.
- **Critérios de aceite:** Soma dos recursos transferidos para a primeira tela em build de produção, comprimidos por gzip ou Brotli, é ≤ 200 KB; relatório registra ferramenta, algoritmo de compressão, lista de recursos e total medido.
- **Dependências:** T-38
- **Arquivos prováveis:** `docs/validation-results.md`

### T-40 — Medir desempenho da experiência
- **Tipo:** Test
- **Descrição:** Medir LCP, INP e p95 de busca no dispositivo e rede de referência.
- **Critérios de aceite:** Em dispositivo móvel de médio porte com 4G simulado, LCP da primeira tela é ≤ 2,5 s e INP de busca/troca de unidade é ≤ 200 ms; p95 de busca é ≤ 1 s em pelo menos 100 execuções com resposta do provedor simulada; relatório registra amostras, dispositivo, rede e resultados.
- **Dependências:** T-38
- **Arquivos prováveis:** `docs/validation-results.md`

### T-41 — Verificar navegadores suportados
- **Tipo:** Test
- **Descrição:** Validar os fluxos essenciais na matriz de navegadores definida na spec.
- **Critérios de aceite:** Matriz registra versão e resultado de busca, seleção, visualização de previsão e alternância em duas versões mais recentes de Chrome, Edge, Firefox e Safari desktop, Chrome Android e Safari iOS; cada combinação prevista tem execução aprovada ou falha identificada.
- **Dependências:** T-38
- **Arquivos prováveis:** `docs/validation-results.md`

## Entrega 9 — Operação e prontidão para lançamento

### T-42 — Selecionar hospedagem estática HTTPS
- **Tipo:** Infra
- **Descrição:** Escolher e documentar a plataforma de hospedagem compatível com a aplicação estática.
- **Critérios de aceite:** Decisão identifica provedor/plano, URL, domínio HTTPS e fallback de rotas SPA; comprova com requisição que página e recursos retornam sem erro por HTTPS; define verificação externa a cada minuto e cálculo mensal de disponibilidade ≥ 99,5%.
- **Dependências:** T-38, T-39, T-40, T-41
- **Arquivos prováveis:** `docs/operations.md`, configuração da hospedagem (a definir)

### T-43 — Definir observabilidade e alertas sem dados pessoais
- **Tipo:** Infra
- **Descrição:** Definir a medição operacional das chamadas ao provedor respeitando as restrições de privacidade.
- **Critérios de aceite:** Documento define métrica por chamada, latência e erro (HTTP 5xx, timeout ou falha de rede), taxa como erros/total de chamadas, alerta quando taxa > 5% em janela de 5 min, retenção de 30 dias e alerta a 80% da cota diária; teste/inspeção confirma que logs não contêm termo nem IP; capacidade ou limitação de observabilidade de requests diretos do navegador tem decisão aprovada antes da publicação.
- **Dependências:** T-42
- **Arquivos prováveis:** `docs/operations.md`

### T-44 — Publicar a aplicação na hospedagem aprovada
- **Tipo:** Infra
- **Descrição:** Configurar e validar a entrega do build estático na plataforma escolhida.
- **Critérios de aceite:** Smoke test recebe resposta válida para a página e recursos por HTTPS nas rotas previstas; verificação externa executa a cada minuto e monitoramento definido em T-43 está ativo; inspeção do build e logs de teste não encontra segredos, termo de busca nem IP.
- **Dependências:** T-39, T-40, T-41, T-42, T-43
- **Arquivos prováveis:** configuração da hospedagem (a definir), `docs/operations.md`

### T-45 — Confirmar compatibilidade dos termos Open-Meteo
- **Tipo:** Infra
- **Descrição:** Registrar a aprovação do uso do provedor e da atribuição no modelo gratuito e sem anúncios.
- **Critérios de aceite:** `docs/release-readiness.md` contém registro datado da aprovação do patrocinador para uso gratuito/sem anúncios, cota aplicável e atribuição CC BY 4.0; sem registro, o gate permanece bloqueado.
- **Dependências:** —
- **Arquivos prováveis:** `docs/release-readiness.md`

### T-47 — Aprovar privacidade e inventário de dados
- **Tipo:** Infra
- **Descrição:** Obter validação de privacidade e LGPD para o fluxo de busca e a operação definida.
- **Critérios de aceite:** `docs/release-readiness.md` contém aprovação do inventário e validação LGPD; inspeção de requests, armazenamento e logs confirma ausência de telemetria comportamental, termo/IP em logs e armazenamento de preferências; sem aprovação, o gate permanece bloqueado.
- **Dependências:** T-43
- **Arquivos prováveis:** `docs/release-readiness.md`, `docs/operations.md`

### T-48 — Liberar lançamento após os gates
- **Tipo:** Infra
- **Descrição:** Consolidar as evidências de validação e autorizações em uma decisão de prontidão.
- **Critérios de aceite:** Checklist registra aprovação de T-34 a T-47, sem gate pendente; cada limitação tem responsável e aprovação datada; a publicação pública permanece bloqueada enquanto faltar qualquer evidência ou aprovação.
- **Dependências:** T-34, T-35, T-36, T-37, T-38, T-39, T-40, T-41, T-42, T-43, T-44, T-45, T-46, T-47
- **Arquivos prováveis:** `docs/release-readiness.md`

## Rastreabilidade com a especificação

### Requisitos funcionais para tarefas

| Requisito funcional | Tarefas correspondentes | Cobertura |
| --- | --- | --- |
| RF-01 — Buscar cidades por texto e exibir até 10 resultados | T-08, T-10, T-12, T-14, T-15, T-16, T-24, T-31, T-32 | Coberto |
| RF-02 — Selecionar e distinguir a cidade | T-12, T-13, T-15, T-24, T-31, T-32, T-33 | Coberto |
| RF-03 — Exibir condições atuais e identificação da cidade | T-01, T-03, T-04, T-06, T-07, T-09, T-11, T-12, T-13, T-17, T-23, T-26, T-31, T-51, T-52 | Coberto |
| RF-04 — Exibir previsões diária e horária para cinco dias | T-01, T-03, T-04, T-06, T-07, T-09, T-11, T-12, T-13, T-18, T-19, T-27, T-28, T-31, T-49, T-51, T-52 | Coberto |
| RF-05 — Alternar entre Celsius e Fahrenheit | T-02, T-05, T-12, T-13, T-20, T-29, T-31, T-49 | Coberto |
| RF-06 — Comunicar estados e permitir nova tentativa | T-08, T-09, T-10, T-11, T-12, T-13, T-16, T-23, T-25, T-33 | Coberto |
| RF-07 — Informar a fonte e que a previsão é estimativa | T-21, T-30, T-49, T-50 | Coberto |
| RF-08 — Exibir a marca SERPRO e não carregar publicidade | T-22, T-30, T-35, T-46, T-50 | Coberto |

**Requisitos funcionais sem tarefa correspondente:** nenhum identificado. Todos os requisitos RF-01 a RF-08 estão ligados a tarefas de implementação e/ou validação.

| Tarefa | Requisitos e critérios relacionados |
| --- | --- |
| T-01 | RF-03, RF-04; AC-03.4, AC-04.3, AC-04.4; EC-07 |
| T-02 | RF-05; AC-05.1 a AC-05.4 |
| T-03 | RF-03, RF-04; AC-03.1, AC-04.1, AC-04.4; A-10 |
| T-04 | RF-03, RF-04; AC-03.4, AC-04.3 |
| T-05 | RF-05; AC-05.1 a AC-05.4 |
| T-06 | RF-03, RF-04; AC-03.1, AC-04.1, AC-04.4; A-10 |
| T-07 | RF-03, RF-04; AC-03.4, AC-04.3; EC-07 |
| T-08 | RF-01; AC-01.4 a AC-01.7; EC-01, EC-02, EC-06; RNF-05, RNF-13 |
| T-09 | RF-03, RF-04; AC-03.4, AC-04.1 a AC-04.4; EC-06, EC-07; RNF-05 |
| T-10 | RF-01; AC-01.4 a AC-01.7; EC-01 a EC-03, EC-06; RNF-13 |
| T-11 | RF-03, RF-04; AC-03.4, AC-04.1 a AC-04.4; EC-06, EC-07 |
| T-12 | RF-01 a RF-06; AC-02.3, AC-02.4, AC-05.3, AC-05.6, AC-06.1 a AC-06.7 |
| T-13 | RF-01 a RF-06; AC-02.3, AC-02.4, AC-05.3, AC-05.6, AC-06.1 a AC-06.7 |
| T-14 | RF-01; AC-01.4 a AC-01.6, AC-01.8; EC-01, EC-02 |
| T-15 | RF-01, RF-02; AC-01.1, AC-01.7, AC-02.1, AC-02.2 |
| T-16 | RF-06; AC-01.3, AC-06.1 a AC-06.7; EC-06 |
| T-17 | RF-03; AC-03.1 a AC-03.4; EC-07 |
| T-18 | RF-04; AC-04.1 a AC-04.3; EC-07 |
| T-19 | RF-04; AC-04.4; EC-07 |
| T-20 | RF-05; AC-05.1 a AC-05.6 |
| T-21 | RF-07; AC-07.1 |
| T-22 | RF-08; AC-08.1; A-11 |
| T-23 | RF-01, RF-02, RF-03, RF-06; AC-01.1 a AC-01.8, AC-02.1 a AC-02.4, AC-03.1 a AC-03.4, AC-06.1 a AC-06.7 |
| T-24 | RF-01, RF-02; AC-01.1 a AC-01.7, AC-02.2; RNF-03 |
| T-25 | RF-06; AC-01.3, AC-06.1 a AC-06.7 |
| T-26 | RF-03; AC-03.1 a AC-03.4; EC-07 |
| T-27 | RF-04; AC-04.1 a AC-04.3; EC-07 |
| T-28 | RF-04; AC-04.4; EC-07 |
| T-29 | RF-05; AC-05.1 a AC-05.6; RNF-03 |
| T-30 | RF-07, RF-08; AC-07.1, AC-07.2, AC-08.1 |
| T-31 | RF-01 a RF-05; AC-01.1, AC-02.1, AC-03.1, AC-04.1 a AC-04.4, AC-05.1; RNF-01 |
| T-32 | RF-01, RF-02; AC-01.2, AC-01.7, AC-02.2; EC-03, EC-04 |
| T-33 | RF-02, RF-06; AC-02.3, AC-02.4, AC-06.3, AC-06.4, AC-06.7; EC-05, EC-06 |
| T-34 | RNF-01 |
| T-35 | RNF-07, RNF-08; AC-08.2; EC-02 |
| T-36 | RNF-03 |
| T-37 | RNF-03; US-08 |
| T-38 | Gate de qualidade do projeto; valida os testes automatizados que cobrem RF-01 a RF-08 e RNF automatizáveis |
| T-39 | RNF-09 |
| T-40 | RNF-02 |
| T-41 | RNF-12 |
| T-42 | RNF-06, RNF-08 |
| T-43 | RNF-07, RNF-10, RNF-13 |
| T-44 | RNF-06, RNF-08, RNF-10 |
| T-45 | A-07; RS-02; R-02; RNF-13; AC-07.1 |
| T-46 | A-11; R-07; AC-08.1 |
| T-47 | A-09; R-07; RNF-07 |
| T-48 | RF-01 a RF-08; RNF-03, RNF-06 a RNF-13; A-07, A-09, A-11 |
| T-49 | RF-04, RF-05, RF-07; AC-04.1 a AC-04.4, AC-05.1 a AC-05.6, AC-07.2 |
| T-50 | RF-07, RF-08; AC-07.1, AC-08.1, AC-08.2; A-11 |
| T-51 | RF-03, RF-04; AC-03.4, AC-04.1, AC-04.3, AC-04.4 |
| T-52 | RF-03, RF-04; AC-03.4, AC-04.1, AC-04.3, AC-04.4 |