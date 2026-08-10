# Desafio Falaê! — Sistema de Gestão de Feedbacks

Sistema full-stack para gestão de feedbacks de clientes de um restaurante, permitindo listagem, filtragem, visualização de indicadores, anotações internas e acompanhamento de status — com uma regra de negócio específica para feedbacks críticos.

## Stack utilizada

| Camada | Tecnologia |
|---|---|
| Backend | Node.js + Express + TypeScript |
| Banco de dados | SQLite |
| ORM | Prisma 7 (com adapter `libsql`) |
| Frontend | React + Vite + TypeScript |
| Estilo | Tailwind CSS |

## Pré-requisitos

- **Node.js 22 LTS** ou superior (o Prisma exige no mínimo 20.19+, mas algumas ferramentas auxiliares como o Prisma Studio exigem 22.5+)
- npm (já vem com o Node)

## Estrutura do repositório

```
falae-desafio/
├── backend/     ← API REST (Express + Prisma + SQLite)
└── frontend/    ← Interface (React + Vite + Tailwind)
```

Cada pasta tem seu próprio `package.json` e é instalada/executada separadamente.

## Como rodar o projeto

### 1. Backend

```bash
cd backend
npm install
```

Crie o arquivo `.env` na pasta `backend/`, usando o `.env.example` como base:

```
DATABASE_URL="file:./prisma/dev.db"
```

Aplique as migrations (isso cria o banco SQLite e as tabelas):

```bash
npx prisma migrate dev
```

Gere o Prisma Client (necessário mesmo após o `migrate dev`, nessa versão do Prisma):

```bash
npx prisma generate
```

Popule o banco com dados de exemplo (15 feedbacks, com anotações e status variados):

```bash
npm run seed
```

Inicie o servidor:

```bash
npm run dev
```

O backend sobe em `http://localhost:3000`. Para confirmar que está no ar, acesse `http://localhost:3000/health` — deve retornar `{"status":"ok"}`.

### 2. Frontend

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

O frontend sobe em `http://localhost:5173` (ou a porta indicada no terminal).

> **Importante:** backend e frontend precisam estar rodando ao mesmo tempo, em terminais separados, para a aplicação funcionar.

## Funcionalidades implementadas

- [x] Listagem de feedbacks (ordenados do mais recente para o mais antigo)
- [x] Filtros combináveis por texto (busca em nome do cliente e comentário), canal, status e nota
- [x] Indicadores (total, nota média, positivos, críticos) que respeitam os filtros ativos
- [x] Visualização de detalhes de um feedback
- [x] Cadastro de anotações internas, com atualização imediata na tela (sem reload manual)
- [x] Alteração de status, com atualização imediata na tela (sem reload manual)
- [x] Regra de negócio: feedbacks críticos (nota 1 ou 2) só podem ser marcados como `CONCLUIDO` se já tiverem ao menos uma anotação registrada — validada no backend, não apenas na interface
- [x] Estados de carregamento, vazio e erro na interface

## Endpoints da API

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/feedbacks` | Lista feedbacks (aceita `search`, `channel`, `status`, `rating` como query params) |
| GET | `/api/feedbacks/indicators` | Retorna indicadores agregados, respeitando os mesmos filtros da listagem |
| GET | `/api/feedbacks/:id` | Detalhe de um feedback |
| GET | `/api/feedbacks/:id/notes` | Lista as anotações de um feedback |
| POST | `/api/feedbacks/:id/notes` | Cria uma nova anotação (`{ "description": string }`) |
| PATCH | `/api/feedbacks/:id/status` | Atualiza o status (`{ "status": "NOVO" \| "EM_ANALISE" \| "CONCLUIDO" }`) |

## Decisões técnicas

- **SQLite + Prisma**: escolhido pela simplicidade de setup — não exige instalar nem configurar um servidor de banco separado, apenas rodar as migrations.
- **Adapter `libsql` em vez de `better-sqlite3`**: o Prisma 7 exige um driver adapter explícito para SQLite. `better-sqlite3` depende de compilação nativa (C++) na máquina onde é instalado, o que exige ferramentas de build nem sempre disponíveis. `libsql` foi escolhido por já distribuir binários pré-compilados para as principais plataformas, evitando esse ponto de fricção.
- **Separação em camadas no backend** (`routes` → `controllers` → `services`): rotas cuidam apenas do roteamento HTTP, controllers traduzem requisição/resposta, e services concentram a lógica de negócio e o acesso ao Prisma — incluindo a regra do feedback crítico, isolada em poucas linhas dentro do service correspondente.
- **Validação da regra de feedback crítico no backend**: embora a interface também trate o erro, a validação de fato acontece no service, antes de qualquer atualização no banco — garantindo que a regra não possa ser contornada por uma chamada direta à API.
- **`comment` como `string | null`, não string vazia**: reflete com mais precisão a realidade de que um cliente pode avaliar sem deixar comentário nenhum.
- **Status HTTP 422 para violação da regra crítica**: diferenciando de 400 (requisição malformada), já que nesse caso a requisição está bem formada, mas viola uma regra de negócio.

## Uso de Inteligência Artificial

O uso de ferramentas de IA durante o desenvolvimento está documentado em [`AI_USAGE.md`](./AI_USAGE.md), incluindo exemplos de sugestões incorretas ou desatualizadas e como foram identificadas e corrigidas.

## Pendências / possíveis melhorias futuras

- Paginação na listagem de feedbacks
- Edição/remoção de anotações já criadas
- Testes automatizados (unitários e de integração)