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

## Consultar compras

A API disponibiliza `GET /api/compras` para listar os registros da tabela `Compra`. Com o servidor na porta padrão, use `http://localhost:3001/api/compras`; se a variável `PORT` estiver configurada, substitua `3001` pela porta configurada.

No Insomnia, crie uma requisição **GET** para essa URL e envie. Não é necessário corpo nem autenticação. Em caso de sucesso, a resposta é `200 OK` com um array JSON; sem compras cadastradas, o resultado é `[]`. Cada item contém:

```json
{
  "id_compra": 1,
  "fk_Cliente_cpf": "52998224725",
  "data_compra": "2026-10-25",
  "valor_total": "150.00"
}
```

`valor_total` é retornado como texto decimal para preservar a precisão do valor armazenado no MySQL. Os registros vêm ordenados do ID mais recente para o mais antigo. Se ocorrer falha na consulta ao banco, a API responde `500` com uma mensagem de erro.

Para testar:

1. Inicie o MySQL e aplique as migrations conforme as instruções acima; a tabela `Compra` deve existir e ter registros para que a resposta contenha itens.
2. Inicie a API com `npm run dev`.
3. No Insomnia, envie `GET http://localhost:3001/api/compras` (ou use a porta definida em `PORT`).
4. Confirme `200 OK`, verifique os campos dos registros e compare-os com a tabela `Compra`. Uma tabela vazia deve retornar `200 OK` e `[]`.

## Remover compra

A API disponibiliza `DELETE /api/compras/:id_compra` para remover uma compra pelo ID. Por exemplo, envie `DELETE http://localhost:3001/api/compras/1` (ou substitua a porta pela definida em `PORT`).

- `200 OK`: compra removida, com a resposta `{ "message": "Compra removida com sucesso." }`.
- `400 Bad Request`: ID inválido ou não positivo.
- `404 Not Found`: não existe compra com esse ID.
- `409 Conflict`: o banco impediu a remoção por existirem registros vinculados; a resposta inclui uma mensagem em `message` para o frontend.
- `500 Internal Server Error`: falha inesperada no servidor.

Pelo esquema atual, os itens e pagamentos avulsos vinculados à compra são removidos em cascata.