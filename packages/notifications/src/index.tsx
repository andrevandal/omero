import { v } from "@omero/schemas";
import { createLogger, fullUrl } from "@omero/utils";
import { render } from "@react-email/render";
import { Resend } from "resend";

import { EmailVerification } from "./templates/email/email-verification.js";
import { ForgotPasswordEmail } from "./templates/email/forgot-password.js";
import { OrganizationInvitation } from "./templates/email/organization-invitation.js";
import { emailTemplates } from "./templates/index.js";

const logger = createLogger();

type NotificationChannel = "email" | "whatsapp";

type BaseNotificationPayload = {
  channel?: NotificationChannel;
  language?: "en" | "pt-br";
};

type NotificationTypes = {
  "email-verification": Parameters<typeof EmailVerification>[0];
  "forgot-password": Parameters<typeof ForgotPasswordEmail>[0];
  "organization-invitation": Parameters<typeof OrganizationInvitation>[0];
};

type NotificationType = keyof NotificationTypes;

type NotificationPayload<T extends NotificationType> = NotificationTypes[T] &
  BaseNotificationPayload;

type Env = {
  RESEND_KEY: string;
  BASE_URL: string;
};

export default function setupNotifications(env: Env) {
  async function sendNotification<T extends NotificationType>(
    type: T,
    payload: Omit<
      NotificationPayload<T>,
      "poweredByLink" | "baseUrl" | "language"
    >
  ) {
    const { channel = "email", ...properties } = payload;

    logger.debug(`Sending notification...`);

    switch (channel) {
      case "email": {
        const template = emailTemplates[type];
        if (!template) {
          throw new Error(`Template not found for notification: ${type}`);
        }

        const resend = new Resend(env.RESEND_KEY);

        const { Component, getSubject, propsSchema } = template;

        const emailProperties = v.parse(propsSchema, {
          ...properties,
          poweredByLink: fullUrl(env.BASE_URL, "/").toString(),
          baseUrl: fullUrl(env.BASE_URL, "/").toString(),
          language: "en",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }) as any;

        const react = <Component {...emailProperties} />;

        const { data, error } = await resend.emails.send({
          from: "Omero <contato@omero.vandal.services>",
          to: [properties.email],
          subject: getSubject(emailProperties),
          react,
          text: await render(react, {
            plainText: true,
          }),
        });

        if (error || !data) {
          logger.error(error);
          throw new Error("Error while sending email");
        }
        break;
      }
      case "whatsapp": {
        throw new Error("Channel WhatsApp not implemented yet");
      }
      default: {
        throw new Error(`Notifiction channel not supported: ${channel}`);
      }
    }
  }

  return {
    sendNotification,
  };
}
