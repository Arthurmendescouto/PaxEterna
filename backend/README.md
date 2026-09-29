# Backend Pax Eterna

## Requisitos

- Node.js e npm
- Docker Desktop em execução, se for usar o banco pelo Compose

## Iniciar o banco e aplicar migrations

Na pasta `backend`, crie o arquivo local `.env` a partir do exemplo e ajuste a senha se necessário:

```powershell
Copy-Item .env.example .env
```

O `.env` contém configurações de conexão. O MySQL do Docker é publicado na porta `3307` para evitar conflito com uma instalação local comum na porta `3306`. A migration cria as tabelas e Knex registra as versões aplicadas na tabela `knex_migrations`.

```powershell
docker compose up -d
docker compose ps
npm install
npm run db:migrate
npm run dev
```

A API fica em `http://localhost:3001`. Para parar o banco sem apagar os dados:

```powershell
docker compose down
```

As migrations são executadas explicitamente e aplicam apenas versões ainda não registradas. Para uma mudança futura, adicione uma nova migration numerada; não edite uma migration que já foi aplicada por outras pessoas.

`npm run db:rollback` desfaz a última migration. A migration inicial remove todas as tabelas que criou, então esse rollback apaga os dados delas. `docker compose down` preserva os dados; `docker compose down -v` apaga o volume do Docker. Esses comandos afetam somente o banco do container, não um MySQL instalado diretamente no computador.

O schema de exemplo não é carregado automaticamente. Os dados de `script-insert.sql` devem ser adicionados depois como seed separado, se necessário.

## Testar cadastro

Envie um `POST` para `http://localhost:3001/api/clientes`, com `Content-Type: application/json` e este corpo:

```json
{
  "nome": "Cliente de Teste",
  "cpf": "529.982.247-25",
  "rg": "123456789",
  "dataNascimento": "1990-05-15",
  "telefones": ["71987654321"],
  "endereco": {
    "logradouro": "Rua de Teste",
    "numEndereco": "123",
    "bairro": "Centro",
    "cep": "40000000",
    "cidade": "Salvador",
    "uf": "BA"
  }
}
```

Esperado: `201 Created` com a propriedade `cliente` na resposta. Repetir o CPF deve retornar `409 Conflict`.

## Testar busca

Depois de cadastrar, faça `GET http://localhost:3001/api/clientes/529.982.247-25`.

Esperado: `200 OK` com o cliente. CPF malformado ou com dígitos verificadores incorretos retorna `400`; CPF válido sem cadastro retorna `404`.

## Verificar validações do cadastro

Envie o `POST` com cada variação abaixo e confirme `400 Bad Request`:

- Remova um campo obrigatório, como `rg`.
- Use um CPF inválido, como `111.111.111-11`.
- Envie telefone que não seja string, por exemplo `"telefones": [123]`.
- Envie `endereco` como texto ou lista, em vez de objeto.

Os campos obrigatórios são `nome`, `cpf`, `rg`, `dataNascimento`, ao menos um telefone textual e os campos de endereço `logradouro`, `numEndereco`, `bairro`, `cep`, `cidade` e `uf`.