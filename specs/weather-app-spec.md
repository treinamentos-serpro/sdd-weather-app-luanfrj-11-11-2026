# Especificação de Produto — Aplicação de Previsão do Tempo

**Status:** pronta para desenvolvimento; aprovação formal pelo patrocinador SERPRO pendente antes do lançamento  
**Fonte:** [discovery.md](discovery.md)  
**Idioma da interface:** português do Brasil (decisão D-05)

## Overview

Aplicação web pública, gratuita, sem anúncios e com a marca do SERPRO, para consultar as condições atuais e a previsão do tempo de uma cidade pesquisada. Deve permitir encontrar e distinguir cidades, visualizar as condições atuais e a previsão diária e horária de cinco dias, e alternar a unidade de temperatura. A experiência deve funcionar em navegadores de desktop e dispositivos móveis e contemplar usuários de teclado e leitores de tela.

Patrocinador: SERPRO. Problema: saber como está o clima em uma cidade. Diferencial: serviço do SERPRO, gratuito e sem anúncios. Público: geral, em todo o mundo. Métricas de sucesso: taxa de consultas concluídas (buscas com resultado que exibem dados) de pelo menos 95%, e taxa de falha de consulta de no máximo 1% (RNF-10). As personas do discovery são ilustrativas.

**Objetivos do produto**

- Permitir consulta rápida de clima por cidade.
- Apresentar condições atuais, previsão diária e previsão horária para cinco dias consecutivos.
- Oferecer uma experiência utilizável em telas pequenas e com recursos de acessibilidade.

**Decisões que orientam esta versão**

- A fonte de geocodificação e previsão escolhida é Open-Meteo (D-01). O uso gratuito descrito no discovery é não comercial e exige atribuição CC-BY 4.0; a compatibilidade dos termos com uso gratuito e sem anúncios deve ser confirmada antes do lançamento.
- Os cinco dias são hoje e os quatro dias seguintes (D-02). Cada dia apresenta mínima, máxima e as demais variáveis diárias disponíveis no provedor. A previsão horária cobre as 120 horas a partir da hora cheia atual no fuso da cidade (AC-04.4).
- Celsius é a unidade padrão (D-03). A preferência vale apenas durante a visita e não é salva entre visitas (decisão do patrocinador).
- Não haverá autenticação nem persistência no servidor (D-04).
- A interface será em pt-BR (D-05).

## Definições

| Termo | Definição |
| --- | --- |
| Termo de busca | Texto do campo de busca sem espaços no início e no fim. |
| Cidade selecionada | Resultado de busca escolhido pela pessoa, identificado por nome, região, país e coordenadas. |
| Rótulo da cidade | Nome, região e país separados por vírgula, omitindo a região quando não retornada (ex.: “Santos, São Paulo, Brasil”). |
| Leitura atual | Temperatura e horário de medição retornados pelo provedor para a cidade selecionada. |
| Unidade ativa | Celsius (°C) ou Fahrenheit (°F), conforme o alternador de unidade. |
| Arredondamento | Temperatura exibida como inteiro pelo arredondamento matemático: 0,5 é arredondado para longe do zero (2,5 → 3; -2,5 → -3). A conversão usa o valor original do provedor, sem arredondar antes (ABNT NBR 5891). |
| Data e horário | Data no formato dd/mm/aaaa e horário em HH:mm (24 h). Todos os horários e datas usam o fuso horário e o calendário local da cidade consultada (A-10). |

## Functional Requirements

| ID | Requisito funcional | Prioridade | Critérios relacionados |
| --- | --- | --- | --- |
| RF-01 | O sistema deve permitir buscar cidades por texto digitado, acionada por Enter ou pelo botão “Buscar”, e apresentar até 10 resultados correspondentes. | Essencial | AC-01.1 a AC-01.8 |
| RF-02 | O sistema deve permitir selecionar um resultado e identificar a cidade selecionada de forma que cidades homônimas possam ser diferenciadas. | Essencial | AC-02.1 a AC-02.4 |
| RF-03 | O sistema deve apresentar as condições atuais da cidade selecionada, incluindo todas as variáveis atuais disponíveis no provedor (AC-03.4), data/horário da leitura e identificação da cidade e país/região. | Essencial | AC-03.1 a AC-03.4 |
| RF-04 | O sistema deve apresentar a previsão diária e a previsão horária para cinco dias consecutivos, começando no dia atual da cidade, com temperaturas mínima e máxima por dia, as demais variáveis diárias disponíveis (AC-04.3) e as 120 horas da previsão horária (AC-04.4). | Essencial | AC-04.1 a AC-04.4 |
| RF-05 | O usuário deve poder alternar a unidade de temperatura entre Celsius e Fahrenheit. | Essencial | AC-05.1 a AC-05.6 |
| RF-06 | O sistema deve comunicar carregamento, resultados vazios e falhas de busca e de consulta meteorológica, oferecendo nova tentativa quando houver falha. | Essencial | AC-06.1 a AC-06.7 |
| RF-07 | O sistema deve informar a atribuição da fonte dos dados meteorológicos e comunicar que a previsão é estimativa. | Essencial | AC-07.1 e AC-07.2 |
| RF-08 | O sistema deve exibir a marca SERPRO em todos os estados da tela e não exibir publicidade nem carregar scripts de anúncios. | Essencial | AC-08.1 e AC-08.2 |

## User Stories

As personas são hipóteses a validar, conforme o discovery.

- **US-01 — Buscar cidade:** Como Ana, a viajante planejadora, quero buscar pelo nome uma cidade de destino para consultar seu clima antes de viajar. **Requisito: RF-01.**
- **US-02 — Selecionar cidade:** Como Ana, a viajante planejadora, quero distinguir cidades homônimas pelos dados de país e região para selecionar meu destino correto. **Requisito: RF-02.**
- **US-03 — Ver condições atuais:** Como Carlos, o profissional de campo, quero consultar a temperatura atual e o horário da leitura na cidade onde trabalho para orientar minhas atividades externas. **Requisito: RF-03.**
- **US-04 — Planejar os próximos dias:** Como Ana, a viajante planejadora, quero ver a previsão dos próximos cinco dias para decidir o que levar e quando sair. **Requisito: RF-04.**
- **US-05 — Alternar unidade:** Como Marina, a usuária de desktop com foco em acessibilidade, quero alternar entre Celsius e Fahrenheit para consultar a temperatura na unidade que prefiro. **Requisito: RF-05.**
- **US-06 — Recuperar falhas de consulta:** Como Carlos, o profissional de campo, quero receber uma indicação de carregamento ou erro e poder tentar novamente para saber se os dados estão disponíveis mesmo em uma rede instável. **Requisito: RF-06.**
- **US-07 — Entender os dados:** Como Ana, a viajante planejadora, quero identificar a fonte dos dados e saber que a previsão é uma estimativa para considerar seus limites ao planejar a viagem. **Requisito: RF-07.**
- **US-08 — Consultar com teclado e leitor de tela:** Como Marina, a usuária de desktop com foco em acessibilidade, quero buscar e selecionar uma cidade, consultar seu clima e alternar a unidade sem usar o mouse para concluir o fluxo de consulta. **Requisitos: RF-01, RF-02, RF-03 e RF-05; acessibilidade: RNF-03.**

## Textos de interface

Textos exibidos ao usuário. Os testes de aceite comparam o texto literalmente.

| Situação | Texto | Critérios |
| --- | --- | --- |
| Estado inicial | Informe o nome de uma cidade para ver o clima. | AC-01.8 |
| Campo vazio ou só com espaços | Informe o nome de uma cidade. | EC-01 |
| Termo com menos de 2 caracteres | Digite pelo menos 2 caracteres. | AC-01.4 |
| Busca sem resultados | Nenhuma cidade encontrada. Confira a grafia e tente novamente. | AC-01.2, EC-03, EC-04 |
| Carregamento | Carregando… | AC-01.3, AC-06.1 |
| Falha na busca | Não foi possível buscar cidades. Tente novamente. | AC-06.7 |
| Falha na consulta meteorológica | Não foi possível carregar os dados. Tente novamente. | AC-06.3, EC-05 |
| Timeout | A consulta demorou mais que o esperado. Tente novamente. | EC-06 |
| Botão de nova tentativa | Tentar novamente | AC-06.3, AC-06.4, AC-06.7 |
| Dado ausente | Dado indisponível | EC-07 |
| Leitura antiga | Os dados podem estar desatualizados. Leitura de HH:mm. | AC-03.3 |
| Aviso de previsão | A previsão é uma estimativa e não substitui alertas oficiais. | AC-07.2 |
| Atribuição | Dados meteorológicos: Open-Meteo, com link “Licença CC BY 4.0”. | AC-07.1 |
| Nome do controle de unidade | Unidade de temperatura | AC-05.5 |

## Acceptance Criteria

Cada critério abaixo segue o formato Given/When/Then e define um resultado observável para teste funcional automatizado. Cada RF tem pelo menos um cenário associado.

### RF-01 — Busca

- **AC-01.1:** **Given** uma busca cujo resultado contém uma ou mais cidades correspondentes, **When** a pessoa envia o termo de busca, **Then** cada cidade retornada é exibida como opção acionável por teclado (Enter ou Espaço).
- **AC-01.2:** **Given** uma busca cujo resultado não contém cidades, **When** a pessoa envia o termo de busca, **Then** é exibida a mensagem de nenhuma cidade encontrada e nenhuma opção de cidade é exibida.
- **AC-01.3:** **Given** uma busca cuja resposta ainda não foi recebida, **When** a pessoa envia o termo de busca, **Then** um indicador de carregamento é exibido e a mensagem de nenhuma cidade encontrada não é exibida antes da resposta.
- **AC-01.4:** **Given** um termo que, sem espaços nas extremidades, tem menos de 2 caracteres, **When** a pessoa aciona a busca, **Then** a aplicação informa o mínimo de 2 caracteres e não envia consulta de geocodificação.
- **AC-01.5:** **Given** um termo com mais de 100 caracteres, **When** a pessoa digita, **Then** o campo aceita no máximo 100 caracteres.
- **AC-01.6:** **Given** um termo válido digitado, **When** a pessoa pressiona Enter ou aciona o botão “Buscar”, **Then** a busca é enviada; digitar não dispara busca automaticamente.
- **AC-01.7:** **Given** uma busca com mais de 10 correspondências, **When** os resultados são exibidos, **Then** no máximo 10 são exibidos, na ordem retornada pelo provedor.
- **AC-01.8:** **Given** a aplicação aberta sem busca realizada, **When** a página carrega, **Then** são exibidos o campo de busca e uma instrução para informar o nome de uma cidade, sem previsão, erro ou mensagem de nenhuma cidade encontrada.

### RF-02 — Seleção e identificação

- **AC-02.1:** **Given** resultados de busca e dados meteorológicos disponíveis para uma das cidades, **When** a pessoa seleciona esse resultado, **Then** o nome, país, região e coordenadas exibidos são os do resultado selecionado, e os dados meteorológicos exibidos são os dessa mesma cidade.
- **AC-02.2:** **Given** dois ou mais resultados com o mesmo nome de cidade e informações de país ou região distintas, **When** os resultados são exibidos, **Then** cada opção exibe o país e a região/estado retornados para aquele resultado; se a região não for retornada, exibe o país e as coordenadas; se nome, país e região forem iguais, as coordenadas, com 4 casas decimais, diferenciam as opções.
- **AC-02.3:** **Given** dados meteorológicos de uma cidade exibidos, **When** a pessoa seleciona outra cidade, **Then** os dados anteriores são removidos da tela imediatamente e o estado de carregamento da nova cidade é exibido.
- **AC-02.4:** **Given** duas consultas enviadas em sequência, **When** a resposta da primeira chega após a da segunda, **Then** a tela mantém apenas os dados da consulta mais recente.

### RF-03 — Condições atuais

- **AC-03.1:** **Given** uma cidade selecionada e uma resposta com temperatura atual, data e horário da leitura, **When** os dados são carregados, **Then** a tela exibe esses três valores e o rótulo da cidade (ver Definições) com os dados retornados na seleção. O horário da leitura é exibido em HH:mm no fuso horário da cidade selecionada, e a data em dd/mm/aaaa no calendário local da cidade (A-10).
- **AC-03.2:** **Given** uma cidade selecionada e Celsius como unidade ativa, **When** as condições atuais são exibidas, **Then** a temperatura atual é acompanhada pelo símbolo °C; quando Fahrenheit está ativa, é acompanhada por °F.
- **AC-03.3:** **Given** uma leitura cujo horário é mais de 60 minutos anterior ao horário de exibição, **When** as condições atuais são exibidas, **Then** a tela exibe “Os dados podem estar desatualizados. Leitura de HH:mm.”, com o horário da leitura.
- **AC-03.4:** **Given** uma cidade selecionada com condições atuais disponíveis no provedor, **When** as condições atuais são exibidas, **Then** são exibidos, quando retornados, os valores de: temperatura; sensação térmica; umidade relativa (%); ponto de orvalho; pressão atmosférica (hPa); velocidade e direção do vento (km/h); rajadas de vento (km/h); precipitação (mm); cobertura de nuvens (%); índice UV; visibilidade (km); e descrição textual do tempo com o ícone correspondente. Valor ausente segue EC-07.

### RF-04 — Previsão

- **AC-04.1:** **Given** uma cidade selecionada e uma previsão disponível para cinco datas consecutivas começando na data atual no fuso da cidade selecionada, **When** a previsão é carregada, **Then** são exibidas exatamente essas cinco datas em ordem consecutiva.
- **AC-04.2:** **Given** uma previsão carregada para cinco datas com valores mínimos e máximos, **When** a previsão é exibida, **Then** cada data apresenta os valores mínimo e máximo, ambos acompanhados pelo símbolo da unidade ativa.
- **AC-04.3:** **Given** uma previsão carregada para cinco datas, **When** a previsão é exibida, **Then** cada data apresenta, quando retornados: descrição textual com ícone; probabilidade máxima de precipitação (%); soma de precipitação (mm); velocidade e rajadas máximas de vento (km/h) e direção dominante; índice UV máximo; horários de nascer e pôr do sol. Valor ausente segue EC-07.
- **AC-04.4:** **Given** uma cidade selecionada e uma previsão horária disponível, **When** a previsão horária é exibida, **Then** são exibidas 120 horas consecutivas começando na hora cheia atual no fuso da cidade selecionada; cada hora apresenta horário HH:mm e data dd/mm/aaaa no fuso da cidade, temperatura com o símbolo da unidade ativa, probabilidade de precipitação (%), precipitação (mm), velocidade do vento (km/h) e descrição textual com ícone, quando retornados. Valor ausente segue EC-07.

### RF-05 — Unidade

- **AC-05.1:** **Given** condições atuais e previsão carregadas em Celsius, **When** a pessoa seleciona Fahrenheit, **Then** todas as temperaturas exibidas passam a usar °F sem nova consulta de cidade; para valores de teste de 0 °C e 100 °C, os valores exibidos são 32 °F e 212 °F, respectivamente.
- **AC-05.2:** **Given** condições atuais e previsão carregadas em Fahrenheit, **When** a pessoa seleciona Celsius, **Then** todas as temperaturas exibidas passam a usar °C sem nova consulta de cidade; para valores de teste de 32 °F e 212 °F, os valores exibidos são 0 °C e 100 °C, respectivamente.
- **AC-05.3:** **Given** a página é carregada sem que a pessoa tenha alternado a unidade, **When** a aplicação é aberta, **Then** Celsius está selecionado; depois de alternar a unidade, ela permanece selecionada até a página ser recarregada (sem persistência entre visitas, A-04).
- **AC-05.4:** **Given** temperaturas originais do provedor de -40 °C e 21,6 °C, **When** a pessoa seleciona Fahrenheit, **Then** são exibidos -40 °F e 71 °F, com arredondamento conforme Definições; a conversão parte do valor original, não do valor já arredondado (21,6 °C → 70,88 °F → 71 °F).
- **AC-05.5:** **Given** o alternador de unidade, **When** a pessoa navega por teclado, **Then** ele tem nome acessível “Unidade de temperatura”, cada opção é acionável por teclado e a opção ativa é informada por leitor de tela.
- **AC-05.6:** **Given** erro ou carregamento sem temperaturas exibidas, **When** a pessoa alterna a unidade, **Then** a unidade ativa muda, nenhuma temperatura é exibida e a nova unidade é aplicada à próxima leitura carregada na sessão.

### RF-06 — Estados e recuperação

- **AC-06.1:** **Given** uma consulta de clima enviada cuja resposta está pendente, **When** a consulta começa, **Then** o estado de carregamento é exibido até a resposta, a falha ou o timeout de RNF-05 (5 s).
- **AC-06.2:** **Given** uma busca concluída sem cidades correspondentes, **When** a resposta vazia é recebida, **Then** é exibida a mensagem de nenhuma cidade encontrada e não é exibida mensagem de falha de clima.
- **AC-06.3:** **Given** uma consulta de clima que retorna falha, **When** a falha é recebida, **Then** é exibida a mensagem “Não foi possível carregar os dados. Tente novamente.”, anunciada a leitores de tela em região de alerta, e um botão “Tentar novamente”.
- **AC-06.4:** **Given** uma mensagem de erro com o controle de tentar novamente, **When** a pessoa aciona esse controle, **Then** uma nova consulta é enviada, o controle fica desabilitado até a resposta e o estado de carregamento é exibido; se essa consulta falhar, a mensagem de erro e o controle de nova tentativa voltam a ser exibidos.
- **AC-06.5:** **Given** resultados de busca, erro ou carregamento atualizados, **When** a atualização ocorre, **Then** a mudança é anunciada por região live sem deslocar o foco do campo de busca ou do controle acionado.
- **AC-06.6:** **Given** preferência do sistema por movimento reduzido ativa, **When** o carregamento é exibido, **Then** o indicador não usa animação contínua e o estado é comunicado também por texto.
- **AC-06.7:** **Given** uma busca cuja resposta falha ou excede o limite de RNF-05, **When** a falha é recebida, **Then** é exibido o texto “Não foi possível buscar cidades. Tente novamente.”, o campo de busca permanece editável com o termo preservado, e o controle “Tentar novamente” reenvia a busca.

### RF-07 — Origem e interpretação dos dados

- **AC-07.1:** **Given** dados meteorológicos exibidos, **When** a pessoa consulta a tela, **Then** a atribuição identifica Open-Meteo e apresenta o texto “Dados meteorológicos: Open-Meteo” e um link com o texto “Licença CC BY 4.0”, acionável por teclado e apontando para a URL oficial da licença.
- **AC-07.2:** **Given** dados de previsão exibidos, **When** a pessoa consulta a tela, **Then** está visível, na mesma região do bloco de previsão e sem necessidade de interação, o aviso “A previsão é uma estimativa e não substitui alertas oficiais.”
- **AC-08.1:** **Given** a página em qualquer estado (inicial, carregamento, resultados, erro ou vazio), **When** a página é exibida, **Then** o logotipo oficial do SERPRO aparece no cabeçalho com texto alternativo “SERPRO”, sem exigir interação. O logotipo é usado conforme as diretrizes de marca fornecidas pelo patrocinador (A-11).
- **AC-08.2:** **Given** a página carregada em qualquer estado, **When** a pessoa a utiliza, **Then** nenhum anúncio ou conteúdo publicitário é exibido, e nenhum script de publicidade ou rastreamento de terceiros é carregado, verificado por teste automatizado das requisições da página.

### US-08 — Uso por teclado e leitor de tela

- **AC-08.1:** **Given** a página aberta e apenas teclado disponível, **When** a pessoa usa Tab, Enter, Espaço e setas para buscar, selecionar uma cidade, consultar o clima e alternar a unidade, **Then** todas as etapas são concluídas sem mouse, com foco visível em cada controle.

## Non-Functional Requirements

Os valores marcados como “Padrão de mercado” na tabela de decisões podem ser ajustados por revisão desta especificação. Para requisitos sem critério quantitativo fechado, a validação deve ser feita contra o padrão ou decisão indicado, antes do aceite de lançamento.

| ID | Categoria | Requisito e verificação de aceite |
| --- | --- | --- |
| RNF-01 | Responsividade | Fluxos RF-01 a RF-07 utilizáveis em retrato e paisagem, a partir de 320 px, sem rolagem horizontal; conteúdo continua disponível com zoom de 200%. Verificar também áreas de toque de pelo menos 44 × 44 px. |
| RNF-02 | Desempenho | Metas: LCP ≤ 2,5 s em 4G na primeira tela; latência p95 ≤ 1 s entre o envio do termo de busca e a exibição dos resultados; INP ≤ 200 ms nas interações de busca e troca de unidade. Método: medição em dispositivo móvel de referência com rede 4G simulada, com pelo menos 100 execuções por métrica para o p95. Na latência de busca, o provedor é substituído por resposta simulada para medir apenas o tempo da aplicação. Dispositivo de referência: smartphone de médio porte com Chrome Android. |
| RNF-03 | Acessibilidade | Atender WCAG 2.1 nível AA. Verificar integralmente por teclado os fluxos de US-08 (busca, seleção, consulta e troca de unidade), ordem lógica e foco visível, nomes acessíveis nos controles, anúncio de atualizações e erros a leitores de tela e respeito à preferência por movimento reduzido. Critério: zero violações WCAG 2.1 AA detectáveis por auditoria automatizada, mais verificação manual com um leitor de tela para desktop e um para dispositivo móvel. |
| RNF-04 | Usabilidade | Em teste de usabilidade, participantes representativos conseguem concluir busca, seleção e consulta sem instruções externas. Meta: ≥ 80% de conclusão sem ajuda, com pelo menos 5 participantes por perfil de público (padrão de mercado para teste de usabilidade). |
| RNF-05 | Confiabilidade | Após falha do provedor, o campo de busca e o alternador de unidade continuam operáveis e é possível tentar novamente. Timeout de 5 s em cada chamada ao provedor (EC-06). |
| RNF-06 | Disponibilidade | Meta de disponibilidade mensal de 99,5%, calculada como minutos com sucesso em verificação externa da aplicação feita a cada minuto, sobre o total de minutos do mês; indisponibilidade do provedor é tratada como risco R-01. Não há cache de dados meteorológicos nesta versão. |
| RNF-07 | Privacidade | Não coletar dados pessoais além do termo de busca necessário à consulta, sem telemetria comportamental, sem armazenamento local de preferências e sem IP nos registros da aplicação. Contadores agregados sem dados pessoais são permitidos (RNF-10). Critério: inventário de dados aprovado pelo patrocinador e validação LGPD antes do lançamento; nenhum cookie ou armazenamento de terceiros é criado, verificado por teste automatizado. |
| RNF-08 | Segurança | Uso somente por conexão HTTPS; entradas de busca tratadas com segurança e dados externos apresentados sem conteúdo executável. Critério: 100% das rotas acessíveis somente por HTTPS e nenhum payload de EC-02 executado em teste automatizado. |
| RNF-09 | Consumo de dados | Respostas comprimidas. Tamanho transferido da página inicial ≤ 200 KB comprimido, medido no build de produção. |
| RNF-10 | Observabilidade | Latência e erros das chamadas ao provedor devem ser registrados e monitoráveis, com alertas para indisponibilidade. Não registrar o termo de busca nem IP (RNF-07). Alerta: taxa de erro acima de 5% em janela de 5 min, sendo erro uma resposta HTTP 5xx, timeout ou falha de rede, sobre o total de chamadas ao provedor. Retenção dos registros operacionais: 30 dias. Ferramenta definida na fase de Plan. |
| RNF-11 | Escalabilidade | Suportar de 10 a 100 usuários simultâneos e 1.000 acessos diários. Critério: teste de carga com 100 usuários simultâneos, com taxa de erro (RNF-10) de no máximo 1% e latência de busca dentro de RNF-02. |
| RNF-12 | Compatibilidade | Duas últimas versões de Chrome, Edge, Firefox e Safari (desktop), e Chrome Android e Safari iOS. |
| RNF-13 | Cota do provedor | Volume dentro dos limites do plano gratuito (10.000/dia, 5.000/hora e 600/minuto, D-01). Critério: consumo monitorado com alerta em 80% da cota diária; busca sem envio automático ao digitar (AC-01.6) e sem repetição automática de falhas (EC-06). |
| RS-01 | Idioma | A interface deve estar em português do Brasil. Verificar textos, mensagens, formatos de data e números apresentados ao usuário; regras de formatação ainda precisam de confirmação. |
| RS-02 | Fonte e licenciamento | Dados meteorológicos e geocodificação devem vir de serviço externo aprovado; atribuição e termos de uso devem ser respeitados. Confirmar se o plano Open-Meteo é compatível com o modelo de negócio antes do lançamento. |

## Edge Cases

### Busca e geocodificação

- **EC-01 — Input vazio:** **Given** o campo de busca vazio ou contendo somente espaços, **When** a pessoa tenta buscar, **Then** a aplicação solicita que ela informe uma cidade, mantém o campo disponível para edição e não envia uma consulta de geocodificação.
- **EC-02 — Caracteres especiais:** **Given** um termo com acentos, espaços, hífens ou apóstrofos, **When** a pessoa busca, **Then** esses caracteres são tratados como parte literal do nome da cidade e a busca é executada sem alterá-los. **Given** um termo contendo marcação ou conteúdo executável, **When** ele é enviado ou exibido, **Then** é tratado como texto e nunca executado nem renderizado como HTML.
- **EC-03 — Geocodificação sem resultados:** **Given** o serviço de geocodificação responde com sucesso e uma lista vazia, **When** a resposta é recebida, **Then** a aplicação informa que nenhuma cidade correspondente foi encontrada, não inicia uma consulta meteorológica e permite editar o termo e tentar novamente.
- **EC-04 — Cidade inexistente ou fora da cobertura:** mesmo tratamento de EC-03 (mensagem única de nenhuma cidade encontrada, com sugestão de conferir a grafia). A aplicação não afirma que a cidade não existe, pois a ausência de resultado não distingue inexistência de falta de cobertura do provedor.

### Consulta meteorológica

- **EC-05 — Falha de API ou de rede:** **Given** a consulta meteorológica retorna erro ou não pode ser concluída por falha de rede, **When** a falha é detectada, **Then** a aplicação mantém a seleção da cidade, informa que os dados não puderam ser carregados e oferece uma ação para tentar novamente; não apresenta dados inválidos como atuais.
- **EC-06 — Timeout:** **Given** qualquer chamada ao provedor (busca ou previsão) permanece sem resposta por 5 segundos (RNF-05), **When** esse limite é atingido, **Then** a aplicação encerra o estado de carregamento, informa que a consulta demorou além do esperado e oferece uma ação para tentar novamente. Não é feita nova tentativa automática.
- **EC-07 — Resposta parcial:** **Given** a resposta meteorológica contém alguns campos ou dias válidos e outros ausentes, **When** os dados são exibidos, **Then** a aplicação apresenta os campos e dias válidos, identifica cada campo ou dia ausente com o texto “Dado indisponível” e não o substitui por zero. Se faltar um dado obrigatório de uma seção, essa seção informa a indisponibilidade sem ocultar as demais seções que tenham dados válidos.

- Resultados com nomes iguais ou localidades em países/regiões diferentes: expor informação suficiente para distinguir as opções.
- Limite de chamadas ou indisponibilidade do provedor: informar que os dados não puderam ser carregados e oferecer nova tentativa. Não há cache de dados meteorológicos nesta versão.
- Falha também durante a nova tentativa: manter a mensagem de erro e a opção de tentar novamente, sem travar a navegação.
- Alternância de unidade antes, durante ou depois de carregar a previsão: todas as temperaturas visíveis devem permanecer consistentes com a unidade escolhida.
- Diferença de fuso entre usuário e cidade: horários e datas são exibidos no fuso e calendário da cidade selecionada (A-10), o que pode diferir do relógio do usuário.
- Valores negativos, extremos ou arredondamento na conversão: apresentar valores válidos e consistentes; regra adotada: arredondar para inteiro conforme ABNT NBR 5891 (AC-05.4).
- Layout em largura de 320 px, orientação paisagem e zoom de 200%: manter conteúdo e controles acessíveis sem sobreposição ou rolagem horizontal.
- Respostas lentas ou fora de ordem: o estado apresentado deve corresponder à consulta selecionada mais recentemente, sem substituir silenciosamente a cidade escolhida.

## Assumptions

- **A-01:** A aplicação será web responsiva acessível pelo navegador, inclusive em dispositivos móveis; não será um aplicativo nativo.
- **A-02:** A busca de cidade será manual e baseada em texto. Geolocalização não faz parte do escopo inicial.
- **A-03:** A interface será somente em pt-BR nesta versão.
- **A-04:** Celsius será a unidade inicial. A alternância vale durante a visita e não é persistida entre visitas.
- **A-05:** A previsão compreende hoje mais quatro dias consecutivos. É apresentada em granularidade diária (mínima e máxima) e horária (120 horas a partir da hora cheia atual da cidade).
- **A-06:** Não haverá login, cadastro, favoritos, histórico, notificações ou persistência no servidor.
- **A-07:** O provedor selecionado é Open-Meteo. A aplicação é gratuita e sem anúncios. O plano gratuito é não comercial e exige atribuição CC BY 4.0; a compatibilidade com este modelo é pré-requisito de lançamento.
- **A-08:** A aplicação é para público geral em todo o mundo, com interface em pt-BR; as personas do discovery são ilustrativas.
- **A-09:** Não será coletado dado pessoal além do termo de busca, e não há telemetria comportamental (RNF-07). A validação LGPD é pré-requisito de lançamento.
- **A-10:** Horários de leitura e da previsão horária são exibidos no fuso horário da cidade selecionada, conforme informado pelo provedor. As datas da previsão são as datas locais da cidade, como calculadas pelo provedor.
- **A-11:** O logotipo oficial do SERPRO será fornecido pelo patrocinador e usado conforme suas diretrizes de marca.

## Risks

| ID | Risco | Mitigação ou decisão necessária |
| --- | --- | --- |
| R-01 | Indisponibilidade, lentidão ou alteração do serviço externo; não há SLA garantido. | Definir timeout e comportamento de falha, monitorar erros e latência e comunicar a indisponibilidade ao usuário (RNF-05, RNF-06). |
| R-02 | Limites e termos do provedor podem não ser compatíveis com volume, monetização ou uso comercial. | Confirmar termos para uso gratuito e sem anúncios, cotas (RNF-13) e atribuição antes do lançamento; qualquer receita ou uso comercial exige plano pago. |
| R-03 | Homônimos, grafias e cobertura geográfica podem levar à seleção ou busca incorreta. | Distinguir resultados por país/região e validar cobertura, acentos e tolerância de busca. |
| R-04 | Previsões distantes ou datas em fuso incorreto podem induzir decisões inadequadas. | Exibir horários e datas no fuso e calendário da cidade consultada (A-10); comunicar que previsões são estimativas (AC-07.2). |
| R-05 | Conversão e arredondamento podem produzir valores inconsistentes entre condições atuais e previsão. | Validar conversões e regra de arredondamento em todos os dados exibidos. |
| R-06 | Escopo pode crescer com pedidos de contas, favoritos, alertas ou histórico. | Manter os itens fora do escopo registrados e submeter mudanças a aprovação. |
| R-07 | Validação LGPD e autorização de uso da marca SERPRO pendentes antes do lançamento. | Obter validação jurídica e autorização de marca antes do lançamento; minimizar coleta (RNF-07). |
| R-08 | Medir sucesso sem telemetria comportamental exige contadores agregados. | Usar as métricas agregadas definidas na Visão geral e revisar a meta após o primeiro mês. |
| R-09 | “Uso em dispositivos móveis” pode ser interpretado como web, PWA ou aplicativo nativo. | Web responsiva confirmada pelo patrocinador; app nativo fora do escopo. |
| R-10 | Usuário pode tratar a previsão como alerta de segurança. | Exibir aviso de estimativa e indicar que alertas oficiais devem ser consultados. |
| R-11 | Adoção pode depender de o público reconhecer o serviço como oficial do SERPRO. | Acompanhar as métricas de sucesso e validar com usuários antes de ampliar o escopo. |
| R-12 | Entrada de busca ou conteúdo externo pode causar exposição a conteúdo inseguro. | Validar entradas, apresentar dados externos como texto seguro e revisar controles de segurança. |
| R-13 | Diferenças de telas, navegadores, zoom e acessibilidade podem comprometer os fluxos. | Verificar requisitos responsivos e de acessibilidade nos ambientes que forem definidos. |
| R-14 | Rede móvel lenta e excesso de dados podem degradar a experiência. | Validar orçamento de desempenho e consumo e monitorar os indicadores aprovados. |

## Out of Scope

- Aplicativos nativos para iOS ou Android.
- Login, contas, perfis ou sincronização entre dispositivos.
- Favoritos, histórico de consultas e persistência de cidades consultadas.
- Notificações, alertas meteorológicos ou substituição de alertas oficiais.
- Previsões históricas.
- Geolocalização automática; a consulta é manual nesta versão.
- Comparação simultânea de várias cidades (uma cidade é consultada por vez).
- Compartilhamento por URL própria ou indexação de páginas por cidade nesta versão.
- Interface em idiomas além de pt-BR.
- Busca por CEP ou coordenadas, correção ortográfica própria e sugestões de localidades; a cobertura é a retornada pelo provedor.
- Funcionamento offline, instalação como PWA e notificações push.
- Cache de dados meteorológicos ou de geocodificação, em navegador ou servidor (RNF-06).
- Integração com provedores alternativos ou de fallback.
- Painel administrativo, backend de gestão e API pública para terceiros.
- Mapas interativos.
- Canal de reporte de erros ou de sugestão de localidades nesta versão.
- Identidade visual além do logotipo SERPRO e personalização de tema pelo usuário.
- Acessibilidade além de WCAG 2.1 AA, e suporte a navegadores fora da lista de RNF-12.
- Monetização, anúncios ou parcerias comerciais nesta versão.

## Decisões registradas

Decisões do patrocinador estão marcadas como “Patrocinador”. As demais seguem padrões de mercado e podem ser alteradas por revisão desta especificação.

| Tema | Decisão | Origem |
| --- | --- | --- |
| Patrocinador | SERPRO. | Patrocinador |
| Produto | Gratuito, sem anúncios, com logotipo do SERPRO. | Patrocinador |
| Público e idioma | Público mundial; interface somente em pt-BR. | Patrocinador |
| Capacidade | 10 a 100 usuários simultâneos; 1.000 acessos por dia; teste de carga com 100. | Patrocinador |
| Plataforma | Somente web responsiva; sem app nativo nem PWA. | Patrocinador |
| Dados exibidos | Todas as variáveis disponíveis no provedor para condições atuais, previsão diária e previsão horária (AC-03.4, AC-04.3, AC-04.4). | Patrocinador |
| Granularidade | Diária (5 dias) e horária (120 horas a partir da hora cheia atual). | Patrocinador |
| Fuso | Todos os horários e datas no fuso horário e calendário da cidade consultada (A-10). | Patrocinador |
| Unidade | Celsius ao abrir; sem persistência entre visitas. | Patrocinador |
| Arredondamento | Matemático (ABNT NBR 5891): 0,5 para longe do zero; conversão a partir do valor original. | Patrocinador |
| Busca | Mínimo de 2 e máximo de 100 caracteres; até 10 resultados na ordem do provedor; acentos e grafias conforme o provedor. | Padrão de mercado |
| Dados desatualizados | Leitura com mais de 60 min recebe aviso. | Padrão de mercado |
| Desempenho e disponibilidade | Timeout de 5 s; LCP ≤ 2,5 s; INP ≤ 200 ms; p95 de busca ≤ 1 s; disponibilidade de 99,5%; erro ≤ 1% no teste de carga. | Padrão de mercado |
| Acessibilidade | WCAG 2.1 AA. | Padrão de mercado |
| Navegadores | Duas últimas versões de Chrome, Edge, Firefox e Safari; Chrome Android e Safari iOS. | Padrão de mercado |
| Privacidade | Sem telemetria comportamental, sem IP nos registros da aplicação e sem cookies de terceiros; registros operacionais por 30 dias. | Padrão de mercado; validação LGPD antes do lançamento |
| Métricas de sucesso | Taxa de consultas concluídas de pelo menos 95%; taxa de falha de consulta de no máximo 1%. | Padrão de mercado |
| Cota do provedor | Alerta em 80% da cota diária (RNF-13). | Padrão de mercado |
| Suporte e feedback | Fora desta versão. | Padrão de mercado |
| Stack e hospedagem | Stack definida pelas instruções do projeto; hospedagem definida na fase de Plan. | Padrão de mercado |
| Prazo | Não definido; não bloqueia o desenvolvimento. | — |

## Pendências antes do lançamento

Não há questões que bloqueiem o desenvolvimento. Os itens abaixo são pré-requisitos de lançamento:

1. Aprovação formal do escopo e do aceite pelo patrocinador SERPRO.
2. Confirmação dos termos do Open-Meteo para uso gratuito, sem anúncios, com atribuição CC BY 4.0 (A-07, R-02).
3. Validação LGPD, política de privacidade e aviso de estimativa (RNF-07, AC-07.2).
4. Fornecimento e autorização de uso do logotipo oficial do SERPRO (A-11, AC-08.1).