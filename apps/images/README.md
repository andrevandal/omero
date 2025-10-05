# images.vandal.services

Este repositório é resposável por entregar as imagens gerenciadas pelo Omero de forma otimizada.

## Inspiração

[cloudflare-images-worker](https://github.com/yo-han/cloudflare-images-worker/tree/develop)

## Tecnologia

- Node v24
- PNPM v10
- Hono
- Drizzle
- Turso
- Cloudflare Workers
- Cloudflare KV
- Cloudflare R2
- Cloudflare Images

## Como funciona?

O serviço receberá requests como:

`/pedrohenri.design/images/primeira-dobra.png?f=auto&q=90&w=423`

A anatomia da url segue o exemplo:

`${bucketKey}/${bucketPath}${searchParams}`

O `bucketKey` será usado para identificar qual o bucket devemos procurar a imagem. Para saber isso, devemos consultar o nosso banco de dados via `@omero/database` usando o `bucketKey` como slug de uma `org` e encontrar os detalhes do storage de armazenamento das imagens (temos dois storages: `originals`, `cache`)

Caso não encontre, retornaremos um redirect para 404.

O `bucketPath` e o `searchParams` serão usados para determinar se entregamos a original, se recuperaremos uma imagem em cache ou precisamos criar uma nova transformação.

1. Se não tiver `searchParams` retornamos a imagem original.
2. Primeiro tentamos recuperar o cache (acho que precisamos de uma chave composta pelo path e o search params). Se tiver, retornamos ele.
3. Sem cache, verificamos se a imagem original existe. Se não, 404.
4. Baseado nos `searchParams` processamos a imagem original e salvamos uma cópia no bucket de cache.
5. Retornamos a imagem de cache.

## Depências internas

- @omero/database
- @omero/schemas
