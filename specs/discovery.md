# Discovery — Aplicação de Previsão do Tempo

> Fase: **Discovery** (Module 01) · Fonte: briefing da empresa solicitante ·
> Próximo artefato: `specs/weather-app-spec.md`

## 1. Contexto

A empresa solicitou uma aplicação de previsão do tempo para uso público por
meio de navegador e dispositivos móveis. O briefing descreve a necessidade de
forma geral, sem detalhar público-alvo, métricas de sucesso, prazos ou
restrições de negócio.

**Problema a resolver:** usuários precisam consultar rapidamente as condições
climáticas atuais e a tendência dos próximos dias para uma cidade de interesse,
em uma interface simples que funcione bem em celulares.

**Objetivos de negócio (inferidos — validar):**

- Oferecer uma ferramenta de consulta de clima confiável e de fácil uso.
- Atender usuários em dispositivos móveis com a mesma qualidade de uso do desktop.

**Escopo declarado no briefing:**

1. Buscar cidades.
2. Ver o clima atual de uma cidade.
3. Ver a previsão para os próximos 5 dias.
4. Alternar a unidade de temperatura entre Celsius e Fahrenheit.
5. Usar a aplicação em dispositivos móveis.

**Fora do escopo declarado (não mencionado no briefing):** contas de usuário,
notificações/alertas, histórico ou favoritos, app nativo, previsões históricas.

## 1.1 Personas

Personas hipotéticas, a validar com o patrocinador antes da Spec. Não se baseiam em pesquisa com usuários reais.

### Ana, a viajante planejadora

- **Perfil:** 32 anos; consulta o clima de cidades de destino antes de viagens curtas e férias.
- **Objetivo principal:** decidir o que levar e quando sair, comparando a previsão de 5 dias de uma ou duas cidades.
- **Contexto de uso:** principalmente **mobile**, em conexão 4G ou Wi-Fi; consultas de poucos minutos, algumas vezes por semana, com cidades que nem sempre são capitais.
- **Métrica de sucesso:** taxa de conclusão do fluxo busca → cidade → previsão de 5 dias em até 3 toques; nenhuma busca válida deve terminar em "não encontrada" sem alternativa.

### Carlos, o profissional de campo

- **Perfil:** 45 anos; técnico de manutenção ou logística que trabalha em áreas externas.
- **Objetivo principal:** verificar rapidamente o clima atual e a previsão do dia na cidade onde está trabalhando.
- **Contexto de uso:** **mobile**, uso frequente ao longo do dia, em rede instável e às vezes com uma mão ocupada; precisa de botões grandes e leitura rápida sob sol forte.
- **Métrica de sucesso:** temperatura atual e previsão do dia exibidas em até 10 s em rede 3G/4G fraca; alta taxa de retorno em dias de trabalho.

### Marina, a usuária de desktop com foco em acessibilidade

- **Perfil:** 38 anos; consulta o clima no computador de trabalho ou de casa e usa leitor de tela e navegação por teclado.
- **Objetivo principal:** consultar o clima de cidades pesquisadas no dia a dia e alternar entre Celsius e Fahrenheit sem depender do mouse.
- **Contexto de uso:** **desktop**, com teclado e leitor de tela; pode também usar o celular com zoom de 200%.
- **Métrica de sucesso:** 100% dos fluxos principais (buscar, selecionar, ver clima, alternar unidade) concluídos apenas com teclado e leitor de tela, sem bloqueios, nos testes de aceite de acessibilidade.

## 2. Requisitos Funcionais

Identificadores `RF-xx` para rastreabilidade nas próximas fases.

| ID    | Requisito | Critérios de aceite (resumo) |
| ----- | --------- | ---------------------------- |
| RF-01 | O usuário deve poder buscar cidades pelo nome. | Dado um termo válido, o sistema exibe a lista de cidades correspondentes; dado um termo sem resultado, exibe mensagem de "nenhuma cidade encontrada". |
| RF-02 | O usuário deve poder selecionar uma cidade do resultado da busca. | Ao selecionar, o sistema exibe o clima da cidade escolhida (RF-03 e RF-04). Cidades homônimas são distinguíveis (país/região). |
| RF-03 | O sistema deve exibir o clima atual da cidade selecionada. | Exibe ao menos temperatura atual e horário/data da leitura; indica a cidade e o país/região. |
| RF-04 | O sistema deve exibir a previsão para os próximos 5 dias. | Exibe 5 dias consecutivos a partir do dia atual, com ao menos temperatura mínima e máxima por dia. |
| RF-05 | O usuário deve poder alternar entre Celsius e Fahrenheit. | Ao alternar, todas as temperaturas exibidas são convertidas sem recarregar a busca; a escolha é mantida durante a sessão. |
| RF-06 | O sistema deve tratar estados de carregamento, erro e vazio. | Durante a consulta, exibe indicador de carregamento; em falha de dados, exibe mensagem com opção de tentar novamente; sem resultados, exibe estado vazio explicativo. |

## 3. Requisitos Não-Funcionais

Metas numéricas marcadas como **(proposta)** precisam ser validadas com o patrocinador.

| ID      | Categoria | Requisito |
| ------- | --------- | --------- |
| RNF-01  | Responsividade | Layout funcional em larguras a partir de 320 px (sem rolagem horizontal, conforme WCAG 2.1 SC 1.4.10); suporte a zoom de 200% sem perda de conteúdo; áreas de toque de pelo menos 44×44 px (proposta); funcionar em orientação retrato e paisagem. Os fluxos de RF-01 a RF-05 devem ser concluíveis em celular. |
| RNF-02  | Desempenho | (proposta) LCP ≤ 2,5 s em 4G para a primeira tela; resposta da busca em p95 ≤ 1 s, medida no backend da aplicação; INP ≤ 200 ms nas interações de busca e troca de unidade. |
| RNF-03  | Acessibilidade | Conformidade com WCAG 2.1 nível AA; navegação completa por teclado com ordem de foco lógica e foco visível; atualizações de clima e erros anunciados a leitores de tela (região `aria-live`); controles com nome acessível, inclusive o alternador °C/°F; respeito a `prefers-reduced-motion`. |
| RNF-04  | Usabilidade | Fluxo principal (buscar → selecionar → ver clima) concluível sem instruções adicionais. |
| RNF-05  | Confiabilidade | Falhas do provedor de dados não quebram a interface; o usuário recebe feedback e pode tentar novamente. Timeout definido para chamadas ao provedor (proposta: 5 s). |
| RNF-06  | Disponibilidade | (proposta) Disponibilidade mensal de 99,5% da aplicação, excluindo indisponibilidades do provedor externo. Quando o provedor falhar, exibir a última consulta em cache com aviso de "dados desatualizados", se disponível. |
| RNF-07  | Privacidade | Não coletar dados pessoais além do termo de busca necessário à consulta (a validar com a área jurídica/LGPD). |
| RNF-08  | Segurança | Conexão somente via HTTPS; validação e escape do termo de busca; cabeçalhos de segurança (ex.: Content Security Policy). |
| RNF-09  | Consumo de dados | Respostas comprimidas e cache de geocodificação para reduzir consumo em redes móveis. Tamanho da página inicial ≤ 200 KB comprimido (proposta). |
| RNF-10  | Observabilidade | Registro de latência e erros das chamadas ao provedor externo, com alertas, para detectar indisponibilidades (R-01) cedo. |
| RNF-11  | Escalabilidade | Número de usuários simultâneos suportados no lançamento a definir (ver Perguntas em Aberto). |
| RNF-12  | Compatibilidade | Funcionar nas versões atuais dos principais navegadores móveis e desktop (lista exata a definir). |

### Restrições

| ID      | Restrição |
| ------- | --------- |
| RS-01   | Interface em português do Brasil (ver S-01). |
| RS-02   | Dados de clima e geocodificação provenientes de serviço público externo; atribuição e termos de uso devem ser respeitados (ver R-02). |

## 4. Riscos

| ID   | Tipo | Risco | Probabilidade | Impacto | Mitigação sugerida |
| ---- | ---- | ----- | ------------- | ------- | ------------------ |
| R-01 | Técnico | Indisponibilidade, lentidão ou mudança de contrato/versão da API do provedor de dados externo. | Média | Alto | Timeouts (RNF-05); cache com aviso de dado desatualizado (RNF-06); camada de integração isolada para troca futura; testes de contrato; monitoramento (RNF-10). |
| R-02 | Técnico/Produto | Cotas, limites de chamadas ou termos de licença do provedor incompatíveis com o volume esperado ou com uso comercial/anúncios. | Média | Alto | Confirmar termos, cotas e custos antes da escolha do provedor (revisão jurídica); cache de respostas; debounce na busca; alerta de consumo de cota. |
| R-03 | Produto | Ambiguidade em nomes de cidades (homônimos, grafias diferentes, acentos). | Alta | Médio | Exibir país/região nos resultados (RF-02); tolerar variações de grafia. |
| R-04 | Produto | Previsão imprecisa para dias mais distantes, ou exibida com fuso horário errado. | Alta | Médio | Comunicar que a previsão é estimativa; exibir data e horário da atualização e o fuso usado. |
| R-05 | Técnico | Conversão de unidades com erro de arredondamento ou inconsistência entre telas. | Baixa | Baixo | Função pura única para conversão, com regra de arredondamento documentada e testes unitários. |
| R-06 | Produto | Escopo mal delimitado (ex.: favoritos, alertas, login) cresce durante a implementação. | Alta | Médio | Registrar o fora de escopo na Spec; mudanças passam por aprovação formal. |
| R-07 | Produto/Legal | Requisitos de LGPD, acessibilidade ou marca não definidos formalmente; coleta de IP ou analytics sem base legal. | Média | Alto | Levar as perguntas da seção 5 ao patrocinador antes da Spec; política de privacidade e base legal antes do go-live; privacy by design. |
| R-08 | Produto | Ausência de métricas de sucesso e de público-alvo, dificultando priorização e avaliação do lançamento. | Alta | Médio | Definir de 2 a 3 métricas (ex.: taxa de conclusão da busca) na Spec e instrumentar telemetria mínima. |
| R-09 | Produto | Escopo de "dispositivos móveis" interpretado de formas diferentes (web responsivo, PWA ou app nativo). | Alta | Alto | Decidir a plataforma na Spec (pergunta D1 do briefing); registrar a decisão e o que fica fora do escopo. |
| R-10 | Produto | Usuário trata o app como fonte de alertas de segurança e se expõe a risco. | Média | Alto | Aviso visível sobre limitações da previsão; alertas oficiais explicitamente fora do escopo ou previstos para versão futura. |
| R-11 | Produto | Baixa adoção por diferencial fraco frente a apps gratuitos de clima. | Média | Alto | Validar problema e diferencial na fase de Discovery; testes de usabilidade com usuários reais antes do lançamento. |
| R-12 | Técnico | Vazamento ou injeção pelo campo de busca (XSS, abuso de entrada). | Baixa | Alto | Validação e escape do termo de busca; Content Security Policy; HTTPS obrigatório; nenhum HTML da API renderizado sem tratamento. |
| R-13 | Técnico | Layout quebrado em telas ou navegadores diferentes (ex.: 320 px, zoom de 200%). | Média | Médio | Testes E2E com emulação de dispositivos móveis (Playwright); validação contra RNF-01; teste em aparelhos reais antes do lançamento. |
| R-14 | Técnico | Desempenho ruim em rede móvel lenta (página pesada, muitas requisições). | Média | Médio | Orçamento de performance (RNF-02 e RNF-09); compressão; carregamento sob demanda; medição de Core Web Vitals. |


## 5. Perguntas em Aberto

Itens que exigem decisão do patrocinador antes de fechar a especificação.

1. **Público-alvo e volume de uso:** quem são os usuários e qual o volume esperado de acessos/consultas por dia?
2. **Idiomas:** a interface será somente em português do Brasil ou também em outros idiomas?
3. **Geolocalização:** o app deve sugerir automaticamente a cidade do usuário (com permissão) ou a busca manual basta?
4. **Unidade padrão:** qual unidade deve ser exibida ao abrir o app (Celsius ou Fahrenheit)? Deve ser lembrada entre visitas?
5. **Persistência:** a última cidade consultada ou a preferência de unidade deve ser guardada entre sessões? Isso exige armazenamento local.
6. **Dados exibidos:** além da temperatura, são necessários umidade, vento, sensação térmica, probabilidade de chuva ou ícones de condição do tempo?
7. **Previsão de 5 dias:** a contagem começa no dia atual ou no próximo dia? Qual granularidade (diária ou por hora)?
8. **Cidades:** a busca cobre o mundo inteiro ou apenas o Brasil? Como tratar cidades sem nome único (ex.: exibir lista com país/estado)?
9. **Plataforma móvel:** basta um site responsivo (PWA/mobile web) ou há exigência de app nativo nas lojas?
10. **Navegadores e sistemas:** quais versões mínimas de iOS, Android e navegadores devem ser suportadas?
11. **Desempenho:** as metas propostas em RNF-02 são aceitáveis? Há outras metas exigidas?
12. **Acessibilidade:** há exigência formal (ex.: WCAG 2.1 AA) ou requisito interno?
13. **Privacidade e legal:** há política de privacidade, termos de uso ou requisitos de LGPD a cumprir? Há necessidade de registrar logs de uso?
14. **Provedor de dados:** há restrição ou aprovação necessária para o uso de provedores externos de dados meteorológicos? Quem arca com custos e limites?
15. **Marca e identidade visual:** há guia de marca, cores ou logotipo a seguir, ou o visual é livre?
16. **Prazo e fase de lançamento:** existe data alvo, MVP mínimo ou versões planejadas?
17. **Métricas de sucesso:** como o sucesso será medido após o lançamento?
18. **Operação:** quem dará suporte e monitoramento após a entrega?
19. **Disponibilidade e escala:** a meta de 99,5% mensal (RNF-06) é aceitável? Há SLA exigido? Qual o número de usuários simultâneos esperado no lançamento (RNF-11)?

### 5.1 Lacunas adicionais do briefing

Perguntas que não estavam cobertas acima. Os itens marcados com ⛔ bloqueiam a fase de Spec.

| # | Lacuna | Pergunta em aberto | Impacto se seguir sem resposta |
| --- | --- | --- | --- |
| A1 ⛔ | "Sua empresa" não é identificada | Quem é o patrocinador, quem decide o escopo e quem aprova a entrega? | Conflitos de escopo sem desempate; aprovações travam no fim do projeto. |
| A2 ⛔ | Problema e motivação ausentes | Qual problema de negócio o app resolve e por que agora? Por que não usar um app público de clima? | Sem diferencial, o produto vira cópia de apps existentes; a priorização vira opinião. |
| A5 | Monetização | O app será gratuito, terá anúncios ou parcerias? | Anúncios trazem scripts de terceiros que afetam desempenho, LGPD e layout; decidir tarde gera retrabalho. |
| A6 | Riscos de negócio para o patrocinador | Quais decisões dependem da previsão (ex.: eventos ao ar livre, logística)? | Não se sabe a criticidade do dado, logo não se dimensiona o cuidado com a precisão. |
| B3 | Padrão de uso | O uso é pontual ou recorrente (cidades frequentes)? | Sem isso, não se sabe se favoritos e histórico são valor ou ruído. |
| C2 | Regras de busca | Aceitar acentos, erros de digitação, nomes parciais, CEP ou coordenadas? Qual o mínimo de caracteres? | Taxa alta de "cidade não encontrada"; usuário abandona a busca. |
| C8 | Fuso horário | "Hoje" e "agora" seguem o fuso da cidade pesquisada ou o do usuário? | Para cidades em outro fuso, dias e horários exibidos ficam errados. |
| C10 | Favoritos, histórico e últimas buscas | Estão dentro ou fora do escopo desta versão? | Expectativa frustrada, ou escopo cresce sem controle na implementação. |
| C11 | Compartilhamento e links | Cada cidade terá URL própria para compartilhar ou indexar? | Links compartilháveis e SEO dependem disso; mudar a arquitetura depois custa caro. |
| E4 | Responsabilidade pela informação | Haverá aviso sobre limitações da previsão? Quem responde por decisões tomadas com base nela? | Risco jurídico se o usuário tomar decisão de segurança com base no app. |
| F4 | Telemetria | O que deve ser medido em produção, e com qual ferramenta? | As métricas de sucesso (pergunta 17) não podem ser coletadas. |
| G1 ⛔ | Critério de aceite final | Quem valida a entrega e com base em quais critérios? | O escopo muda a cada revisão; o "pronto" nunca é atingido. |
| G2 | Restrições tecnológicas corporativas | Há stack, cloud ou padrões obrigatórios da empresa? | Decisões de arquitetura podem contrariar padrões internos e exigir reescrita. |
| G3 | Canal de feedback do usuário | Como o usuário reporta erros ou sugere cidades? | Problemas de dados chegam só por reclamações tardias. |


## 6. Suposições

Premissas adotadas para seguir para a fase de Spec. Devem ser validadas.

- **S-01:** A interface será em português do Brasil (conforme convenção do projeto).
- **S-02:** A busca de cidades é feita por texto digitado pelo usuário; geolocalização é fora do escopo inicial.
- **S-03:** Não há login, cadastro de usuários, favoritos, histórico ou notificações nesta versão.
- **S-04:** A aplicação é uma interface web responsiva acessível pelo navegador do celular; não há app nativo.
- **S-05:** A "previsão de 5 dias" significa 5 dias consecutivos, com temperaturas mínima e máxima por dia.
- **S-06:** Não haverá armazenamento de dados pessoais; a preferência de unidade vale apenas para a sessão atual.
- **S-07:** Os dados meteorológicos serão obtidos de um serviço externo público que não exige chave de API, a confirmar quanto a limites e termos (ver R-02).
- **S-08:** Celsius é a unidade padrão ao abrir a aplicação.
- **S-09:** A conversão de unidades é feita na exibição, sem nova consulta ao serviço externo.
- **S-10:** O público é geral, sem requisitos especiais além dos listados na seção 3.

## 7. Decisões

Decisões tomadas pelo patrocinador para destravar a especificação. Cada uma resolve parte das perguntas em aberto; o que não foi resolvido segue listado.

| ID | Decisão | Justificativa | Perguntas resolvidas | Ainda em aberto |
| -- | ------- | ------------- | -------------------- | --------------- |
| D-01 | Fonte de dados: **Open-Meteo** (geocodificação e previsão), sem API key. | Cobre busca de cidades e previsão em um único provedor, sem custo de chave. Os termos do plano gratuito são **somente para uso não comercial** e exigem atribuição CC-BY 4.0. Limites do plano gratuito: 10.000 chamadas/dia, 5.000/hora e 600/minuto. | Q14 (provedor escolhido); E1 (fonte definida); parte de Q8 (cobertura de busca, a confirmar). | Se houver assinatura ou anúncios (A5), é obrigatório contratar plano pago, que pode exigir chave de API e muda o custo (E3). Não há SLA garantido (R-01, Q19). Atribuição a ser incluída na interface. |
| D-02 | "5 dias" = **hoje + 4 dias**, ou seja, 5 dias consecutivos começando no dia atual. | Mantém a previsão útil para o dia em curso, sem exigir a visualização de amanhã. | Q7 (início da contagem). | Granularidade: diária (assumida em S-05) ou horária ainda não confirmada. |
| D-03 | Unidade padrão ao abrir: **Celsius**. | Padrão adequado ao público-alvo pt-BR. | Q4 (unidade padrão). | Se a escolha deve ser lembrada entre visitas (Q5), depende de D-04. |
| D-04 | **Sem autenticação e sem persistência no servidor.** | Elimina contas, favoritos e histórico no backend, reduzindo escopo e exposição de dados pessoais. Confirma S-03 e S-06. | Q13 (dados pessoais e logs de uso, parcialmente); Q5 (persistência no servidor); C10 (favoritos e histórico fora do escopo). | Persistência local no navegador (ex.: preferência de unidade) não foi decidida. Logs técnicos de infraestrutura para RNF-10 ainda precisam de definição. |
| D-05 | Idioma da interface: **pt-BR**. | Alinha o produto ao público-alvo e ao idioma já adotado em S-01 e RS-01. | Q2 (idioma da interface). | Internacionalização futura (F5), formatação de datas e números e idioma dos nomes de cidades retornados pelo provedor a verificar. |

### Impacto nas demais seções

- **S-07** deixa de ser suposição e passa a ser decisão (D-01), com a ressalva de uso não comercial.
- **R-02** é agravado pela condição comercial: a monetização (A5) passa a ser decisão que determina o custo e o plano do provedor.
- **Q6, Q9, Q10, Q11, Q12, Q15 a Q18** e as lacunas A1, A2 e G1 seguem em aberto.

