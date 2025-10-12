import { v } from "@omero/schemas";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

import { poweredByLink } from "./__components/constants.js";
import { Logo } from "./__components/ui/logo.js";

export const propsSchema = v.object({
  name: v.string(),
  email: v.string(),
  code: v.string(),
  verifyButtonLink: v.string(),
  language: v.optional(v.picklist(["en", "pt-br"]), "en"),
});

type TemplateProperties = v.InferOutput<typeof propsSchema>;

const i18n = {
  en: {
    subject: "You're activation code is",
    preview: "Verify your account on Omero",
    greetings: "Hi",
    verifyAccount: "Verify your account",
    receivingEmail:
      "You're receiving this email because you requested to verify your account.",
    verifyButton: "Verify account",
    linkValidityInfo:
      "This link and code will only be valid for the next 5 minutes. If the link does not work, you can use the verification code directly:",
    emailSentTo: "This email was sent to",
  },
  "pt-br": {
    subject: "Seu código de ativação é",
    preview: "Verifique sua conta no Omero",
    greetings: "Olá",
    verifyAccount: "Verifique sua conta",
    receivingEmail:
      "Você está recebendo este e-mail porque solicitou a verificação da sua conta.",
    verifyButton: "Verificar conta",
    linkValidityInfo:
      "Este link e código serão válidos apenas pelos próximos 5 minutos. Se o link não funcionar, você pode usar o código de verificação diretamente:",
    emailSentTo: "Este e-mail foi enviado para",
  },
};

export const getSubject = ({
  language,
  code,
}: Pick<TemplateProperties, "language" | "code">) => {
  const t = i18n[language];

  return `${t["subject"]} ${code}`;
};

export const EmailVerification: React.FC<Readonly<TemplateProperties>> = ({
  name,
  email,
  code,
  verifyButtonLink,
  language,
}: TemplateProperties) => {
  const t = i18n[language];
  return (
    <Html>
      <Head />
      <Preview>{t.preview}</Preview>
      <Tailwind>
        <Body className="bg-white font-sans text-gray-800">
          <Container className="mx-auto max-w-lg px-4 py-8">
            <Logo />

            <Heading className="m-0 py-4 text-2xl font-semibold tracking-tighter text-gray-950">
              {t.verifyAccount}
            </Heading>
            <Section className="">
              <Text className="m-0">
                {t.greetings}, <strong>{name}</strong>.
              </Text>
              <Text className="m-0">{t.receivingEmail}</Text>
              <Button
                className="my-6 block rounded bg-gray-800 px-6 py-3 text-center font-semibold text-white no-underline"
                href={verifyButtonLink}
              >
                {t.verifyButton}
              </Button>
            </Section>
            <Section className="">
              <Text className="m-0">{t.linkValidityInfo}</Text>
              <code className="spacing mx-auto mt-4 block rounded bg-gray-200 p-2 text-center font-mono text-2xl font-bold tracking-[1rem] text-gray-900">
                {code}
              </code>
            </Section>

            <Hr className="my-4 border-gray-500" />

            <Section>
              <Text className="text-sm text-gray-400">
                {t.emailSentTo} {email}.
              </Text>
              <Link
                href={poweredByLink}
                className="text-sm text-gray-600"
                target="_blank"
              >
                Omero
              </Link>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(EmailVerification as any).PreviewProps = {
  code: "123456",
  name: "John Doe",
  email: "lCtHj@example.com",
  verifyButtonLink: "http://localhost:8787/verify-email",
  language: "en",
} satisfies TemplateProperties;

export default EmailVerification;
