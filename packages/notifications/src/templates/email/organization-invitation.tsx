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
import { Logo } from "./__components/logo.js";

export const propsSchema = v.object({
  email: v.string(),
  inviterName: v.string(),
  organizationName: v.string(),
  role: v.string(),
  acceptInviteLink: v.string(),
  language: v.optional(v.picklist(["en", "pt-br"]), "en"),
});

type TemplateProperties = v.InferOutput<typeof propsSchema>;

const i18n = {
  en: {
    subject: "You have been invited to join",
    preview: "Join the organization on Omero",
    greetings: "Hi",
    invitationTitle: "Invitation to join",
    invitationText: "has invited you to join their organization as",
    acceptButton: "Accept invitation",
    invitationValidityInfo: "This invitation link will expire in 2 days.",
    emailSentTo: "This email was sent to",
    roles: {
      admin: "Administrator",
      member: "Member",
    },
  },
  "pt-br": {
    subject: "Você foi convidado para entrar em",
    preview: "Entre na organização no Omero",
    greetings: "Olá",
    invitationTitle: "Convite para entrar em",
    invitationText: "convidou você para entrar na organização como",
    acceptButton: "Aceitar convite",
    invitationValidityInfo: "Este link de convite expirará em 2 dias.",
    emailSentTo: "Este e-mail foi enviado para",
    roles: {
      admin: "Administrador",
      member: "Membro",
    },
  },
};

export const getSubject = ({
  language,
  organizationName,
}: Pick<TemplateProperties, "language" | "organizationName">) => {
  const t = i18n[language];
  return `${t["subject"]} ${organizationName}`;
};

export const OrganizationInvitation: React.FC<TemplateProperties> = ({
  email,
  inviterName,
  organizationName,
  role,
  acceptInviteLink,
  language = "en",
}: TemplateProperties) => {
  const t = i18n[language];
  const currentRole = (["admin", "member"].includes(role) ? role : "member") as
    | "admin"
    | "member";

  return (
    <Html>
      <Head />
      <Preview>{t.preview}</Preview>
      <Tailwind>
        <Body className="bg-white font-sans text-gray-800">
          <Container className="mx-auto max-w-lg px-4 py-8">
            <Logo />

            <Heading className="m-0 py-4 text-2xl font-semibold tracking-tighter text-gray-950">
              {t.invitationTitle}{" "}
              <span className="text-gray-900">{organizationName}</span>
            </Heading>
            <Section className="">
              <Text className="m-0">{t.greetings}.</Text>
              <Text className="m-0">
                <strong>{inviterName}</strong> {t.invitationText}{" "}
                <strong>{t.roles[currentRole]}</strong>.
              </Text>
              <Button
                className="my-6 block rounded bg-gray-800 px-6 py-3 text-center font-semibold text-white no-underline"
                href={acceptInviteLink}
              >
                {t.acceptButton}
              </Button>
            </Section>
            <Section className="">
              <Text className="m-0">{t.invitationValidityInfo}</Text>
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
(OrganizationInvitation as any).PreviewProps = {
  email: "jane@example.com",
  inviterName: "John Smith",
  organizationName: "Acme Inc",
  role: "admin",
  acceptInviteLink:
    "http://localhost:8787/accept-invitation/123e4567-e89b-12d3-a456-426614174000",
  language: "en",
} satisfies TemplateProperties;

export default OrganizationInvitation;
