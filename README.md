# Omero

<div style="text-align: center;">
  <img src="./logo.svg" alt="Omero Logo" width="350" />
</div>

Omero é um CMS de sites personalizados com finalidade de ser simples.

## Desenvolvimento

Execute o seguinte comando para iniciar o desenvolvimento:

```sh
pnpm run dev
```

Para executar via Wrangler, basta executar os seguintes comandos:

```sh
pnpm run build
pnpm run start
```

## Cloudflare Bindings

O ambiente planejado para essa aplicação é o Cloudflare Pages.

Dessa forma, pode ser interessante utilizar alguns serviços do Cloudflare nesta aplicação.

Assim, será necessário configurar os bindings no `wrangler.toml`.

Para a aplicação ter os bindings configurados, basta executar o seguinte comando:

```sh
pnpm tun typegen
```

## Deployment

Primeiro, builde a aplicação para produção:

```sh
pnpm run build
```

Depois, para subir sua aplicação para Cloudflare Pages, execute o comando a seguir:

```sh
npm run deploy
```

## Estilo

Estamos usando [Tailwind CSS](https://tailwindcss.com/) junto do [Shadcn UI](https://ui.shadcn.com/).

## Contribuição

Constribuições são bem-vindas! 🎉

Sinta-se livre para abrir uma issue ou submeter um pull request.

Caso deseje conversar antes, entre em contato comigo.
