import { LoaderFunctionArgs } from '@remix-run/cloudflare'

function formatTitle(title?: string) {
  const defaultTitle = 'Omero | An open source CMS for your digital business'
  return title ? `${title} | Omero` : defaultTitle
}

function formatDescription(description?: string) {
  const defaultDescription =
    'An open source CMS for your digital business. Get started with Omero.'
  return description ?? defaultDescription
}

type MetaFactoryProps = {
  baseUrl?: string
  title?: string
  description?: string
}

export const MetaFactory = (data: MetaFactoryProps) => {
  let { baseUrl, title, description } = data ?? {}

  title = formatTitle(title)
  description = formatDescription(description)

  if (!baseUrl) {
    baseUrl = 'https://omero.vandal.services'
  }

  return [
    {
      title
    },
    {
      name: 'description',
      content: description
    },
    {
      property: 'og:title',
      content: title
    },
    {
      property: 'og:description',
      content: description
    },
    {
      property: 'og:image',
      content: `${baseUrl}/social-media-thumb.png`
    },
    {
      property: 'og:type',
      content: 'website'
    },
    {
      name: 'twitter:title',
      content: title
    },
    {
      name: 'twitter:description',
      content: description
    },
    {
      name: 'twitter:card',
      content: 'summary_large_image'
    },
    {
      name: 'twitter:image',
      content: `${baseUrl}/social-media-thumb.png`
    }
  ]
}

export const extractBaseUrlFromContext = (
  context: LoaderFunctionArgs['context']
) => {
  const { BASE_URL, CF_PAGES_BRANCH, CF_PAGES_URL } = context.cloudflare.env

  return (
    BASE_URL ??
    (CF_PAGES_BRANCH !== 'main' && CF_PAGES_URL
      ? CF_PAGES_URL
      : 'https://localhost:5173')
  )
}
