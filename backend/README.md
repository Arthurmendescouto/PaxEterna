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

## Compras

As rotas usam `http://localhost:3001/api/compras` (substitua a porta se `PORT` estiver configurada). Antes de testar, aplique as migrations com `npm run db:migrate`.

### Consultar compras

Envie `GET /api/compras`, sem corpo. Em caso de sucesso, a resposta é `200 OK` com um array JSON; sem compras cadastradas, o resultado é `[]`. Cada compra contém:

```json
{
  "id_compra": 1,
  "fk_Cliente_cpf": "52998224725",
  "data_compra": "2026-10-25",
  "valor_total": "150.00",
  "itens": [
    {
      "itemId": 1,
      "tipo": "produto",
      "nome": "Urna",
      "quantidade": 1,
      "precoUnitario": "150.00"
    }
  ]
}
```

`valor_total` e `precoUnitario` são retornados como texto decimal para preservar a precisão do MySQL. Os registros vêm ordenados do ID mais recente para o mais antigo.

### Cadastrar compra

Envie `POST /api/compras` com `Content-Type: application/json`. O CPF pode ser `null`; itens devem usar `tipo: "produto"` (ID da tabela `Produto`) ou `tipo: "servico"` (ID de um `Recurso` do tipo serviço). O backend valida os dados e o estoque, calcula o total usando os preços atuais do banco, reduz o estoque dos produtos e grava compra e itens em uma transação.

```json
{
  "cpfCliente": "52998224725",
  "dataCompra": "2026-10-25",
  "itens": [
    { "itemId": 1, "tipo": "produto", "quantidade": 1 },
    { "itemId": 2, "tipo": "servico", "quantidade": 1 }
  ]
}
```

Uma compra sem cliente pode enviar `"cpfCliente": null`. Em sucesso, retorna `201 Created` com a compra cadastrada. Dados inválidos retornam `400`, cliente ou item inexistente retorna `404`, e falta de estoque retorna `409`.

### Atualizar compra

Envie `PUT /api/compras/:id_compra` com o mesmo formato do cadastro. A atualização substitui os itens existentes, atualiza cliente/data/total e ajusta o estoque em uma única transação: devolve ao estoque os produtos da versão anterior e desconta os da nova versão. Se a atualização falhar, as alterações são desfeitas.

Em sucesso, retorna `200 OK` com a compra atualizada; compra inexistente retorna `404`. As demais respostas de erro seguem as validações do cadastro.

Para testar:

1. Inicie o MySQL e aplique as migrations conforme as instruções acima.
2. Inicie a API com `npm run dev`.
3. Use o Insomnia para enviar `GET`, `POST` e `PUT` para `http://localhost:3001/api/compras`.
4. Confirme as respostas e confira `Compra`, `Item_compra` e o estoque de `Produto` no banco.