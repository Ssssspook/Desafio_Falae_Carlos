# Uso de Inteligência Artificial

## Ferramentas utilizadas

- Claude (Anthropic) — principal assistente utilizado durante todo o desenvolvimento, incluindo planejamento, geração de código, depuração e revisão de documentação.
- ChatGPT — consultado pontualmente para comparar uma sugestão alternativa de configuração do TypeScript

## Como a IA foi utilizada

A IA foi utilizada em praticamente todas as etapas do desenvolvimento:

- **Planejamento**: elaboração do roteiro de desenvolvimento inicial, dividindo o desafio em etapas menores (setup, API base, filtros/indicadores, regras de escrita, frontend, documentação).
- **Geração de código**: primeira versão das rotas, controllers, services, componentes React e hooks customizados.
- **Correção de bugs**: identificação e correção de comportamentos inesperados na interface (como o salto de rolagem ao atualizar o status de um feedback) e no backend (como filtros inválidos derrubando rotas com erros não tratados do Prisma).
- **Sugestão de testes**: elaboração de roteiros de teste manual para validar cada funcionalidade — incluindo casos de borda da regra de feedback crítico, estados de carregamento/erro/vazio, e um teste de execução "do zero" simulando a experiência de um avaliador.
- **Depuração**: investigação de uma sequência extensa de erros de compatibilidade entre Prisma 7 (lançamento recente), TypeScript, `ts-node-dev`/`tsx` e adapters de banco de dados — detalhado na seção seguinte.
- **Revisão de decisões**: discussão sobre trade-offs antes de aplicar mudanças (por exemplo, ao decidir entre `better-sqlite3` e `libsql` como adapter).
- **Documentação**: estruturação deste `AI_USAGE.md` e do `README.md`.

Em nenhum momento o código gerado foi aplicado sem antes ser lido, testado manualmente (via navegador, `Invoke-RestMethod` e Prisma Studio) e, quando necessário, corrigido.

## Exemplos de interações

1. **"Preciso de ajuda para realizar um projeto. Me ajuda a criar um plano para o desenvolvimento deste projeto, e um ponto de partida."** — usado no início, com um README modificado do desafio anexado, para gerar o roteiro de desenvolvimento e a decisão inicial de stack (Express + Prisma + SQLite + libsql, React + Vite + Tailwind).

2. **"me explica o que ta acontecendo com o libsql e os adaptadores que voce sugeriu"** — usado durante a configuração do Prisma 7, para entender a arquitetura de "driver adapters" introduzida nessa versão, antes de aceitar a mudança de `better-sqlite3` para `libsql`.

3. **"aconteceu um bug, ao alterar o status, a pagina atras do modal volta pro topo."** — usado para investigar por que a lista de feedbacks "encolhia" bruscamente durante a atualização após uma ação do usuário, revelando que os componentes exibiam o estado de carregamento (skeleton) mesmo quando já havia dados anteriores na tela, o que empurrava a posição de rolagem de volta ao topo.

## Sugestão incorreta ou incompleta

**Situação:** logo na configuração inicial do Prisma Client, a IA sugeriu o seguinte código para `src/lib/prisma.ts`:

```typescript
import { PrismaClient } from "../../generated/prisma/index.js";
export const prisma = new PrismaClient();
```

**Qual foi o problema:** essa sugestão estava desatualizada em relação ao Prisma 7 (lançamento muito recente) em pelo menos três pontos: (1) o arquivo de entrada do client gerado não é `index.js`, mas `client.js`; (2) o Prisma 7 removeu o motor de banco embutido em Rust e passou a exigir um *driver adapter* explícito, então `new PrismaClient()` sem adapter lança erro de argumento obrigatório ausente; (3) o adapter inicialmente sugerido (`better-sqlite3`) depende de compilação nativa em C++, que falhou no Windows por falta do Visual Studio Build Tools.

**Como percebi o problema:** cada uma dessas falhas apareceu como erro real ao rodar o código — erro de módulo não encontrado no editor, erro de argumento faltando no `new PrismaClient()`, e depois uma falha de build do `node-gyp` no terminal, com mensagens claras o suficiente para pesquisar cada uma delas.

**O que precisou ser alterado:** corrigi o caminho do import para `client.js`; troquei o adapter para `@prisma/adapter-libsql` (que distribui binários pré-compilados, evitando a necessidade de compilar C++ localmente); e fixei a versão do `@libsql/client` em `0.8.1`, já que versões mais recentes quebram a compatibilidade com o adapter do Prisma.

**Como validei a solução final:** rodei `npm run seed` e conferi que os 15 registros eram criados sem erro, depois testei as rotas de leitura no navegador e as de escrita via `Invoke-RestMethod`, confirmando que o client conseguia ler e escrever no banco corretamente.

## Validação

A validação de tudo o que foi gerado ou sugerido pela IA foi feita por:

- **Testes manuais no navegador**, para as rotas `GET` e para toda a interface (listagem, filtros, indicadores, modal de detalhe).
- **Testes manuais via `Invoke-RestMethod` (PowerShell)**, para as rotas `POST` e `PATCH`, incluindo os dois cenários da regra de feedback crítico (bloqueio sem anotação e liberação com anotação) e casos de borda (descrição só com espaços, status inválido, feedback inexistente).
- **Inspeção do banco de dados** via Prisma Studio, para confirmar que os dados persistidos batiam com o esperado após cada operação de escrita.
- **Teste de execução "do zero"**: o repositório foi clonado em uma pasta separada, simulando a experiência de um avaliador, e todos os comandos de instalação/configuração foram executados na ordem documentada no `README.md`. Esse teste revelou uma lacuna real (o `npx prisma migrate dev` não gerava o Prisma Client automaticamente nessa versão, exigindo um `npx prisma generate` explícito), que foi corrigida na documentação antes da entrega.
- **Uso do DevTools do navegador** (aba Network, com throttling de rede) para confirmar visualmente que os estados de carregamento (skeletons) estavam sendo exibidos corretamente, já que em ambiente local as respostas são rápidas demais para observar isso a olho nu sem simular uma conexão mais lenta.

## Decisões técnicas

Uma decisão que envolveu comparar alternativas antes de implementar foi a escolha entre `better-sqlite3` e `libsql` como *driver adapter* do Prisma. A primeira tentativa (`better-sqlite3`) falhou por exigir compilação nativa via `node-gyp`, que por sua vez dependia do Visual Studio Build Tools — uma ferramenta pesada (~6 GB) que eu não tinha instalada. Antes de instalar essas ferramentas, pesquisei uma alternativa: o `libsql`, que é uma reimplementação do SQLite com binários pré-compilados para as principais plataformas via NAPI-RS, evitando compilação local. Optei pelo `libsql` por resolver o problema imediato sem exigir uma instalação pesada e sem alterar nenhuma outra parte da configuração (a URL do banco no `.env` permaneceu a mesma).

Outra decisão relevante foi a troca de ts-node-dev por tsx como executor de TypeScript em modo de desenvolvimento. O projeto começou com ts-node-dev, mas devido a erros e problemas do ts-node-dev pra lidar com projetos ESM, optei por trocar de ferramenta: tsx, que já foi construído pensando em projetos ESM modernos, resolveu o conflito sem exigir nenhuma outra mudança de configuração.

## Domínio da solução

Neste desafio, tive contato com várias tecnologias que ainda não tinha muita familiaridade, como o Prisma. Usar inteligência artificial junto com pesquisas e as documentações ajudaram bastante a aprender como utilizá-las.

Após terminar o desafio, considero que domino em um nível moderado a separação em camadas do backend (rotas, controllers, services), a modelagem do banco com Prisma, a implementação e o teste da regra de negócio do feedback crítico, e o fluxo de dados no frontend (hooks customizados, estados de carregamento/erro, atualização sem reload). Consigo explicar o motivo de cada decisão tomada, incluindo pontos em que discordei ou ajustei sugestões da IA.

A parte que eu ainda estudaria com mais profundidade é a arquitetura interna do Prisma 7, já que meu entendimento dela veio principalmente de resolver os erros que apareceram na prática. Também estudaria mais como aplicar testes automatizados.