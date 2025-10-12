import { generateId } from "@omero/utils";
import { betterAuth } from "better-auth";
import {
  drizzleAdapter,
  type DB,
  type DrizzleAdapterConfig,
} from "better-auth/adapters/drizzle";
import { apiKey, emailOTP, organization } from "better-auth/plugins";

import { ac, admin, member, owner } from "./permissions.js";

type DBConfig = [DB, DrizzleAdapterConfig];
type EnvConfig = {
  BASE_URL: string;
  REGISTER_ENABLED?: boolean;
};
type Callbacks = {
  sendInvitationEmail: NonNullable<
    Parameters<typeof organization>[0]
  >["sendInvitationEmail"];
  sendVerificationOTP: NonNullable<
    Parameters<typeof emailOTP>[0]
  >["sendVerificationOTP"];
};

export const createAuth = (
  dbConfig: DBConfig,
  env: EnvConfig,
  callbacks: Callbacks
) =>
  betterAuth({
    database: drizzleAdapter(...dbConfig),
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60,
      },
    },
    advanced: {
      cookiePrefix: "omero",
      database: {
        generateId: () => generateId(),
      },
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      disableSignUp: env.REGISTER_ENABLED,
    },
    plugins: [
      organization({
        ac,
        roles: {
          owner,
          admin,
          member,
        },
        allowUserToCreateOrganization: false,
        sendInvitationEmail: callbacks.sendInvitationEmail,
        // sendInvitationEmail: async ({
        //   id,
        //   role,
        //   email,
        //   organization,
        //   inviter,
        // }) => {
        //   logger.debug("Sending organization invitation email...");

        //   await sendNotification("organization-invitation", {
        //     email,
        //     inviterName: inviter.user.name,
        //     organizationName: organization.name,
        //     role,
        //     acceptInviteLink: fullUrl(
        //       env.BASE_URL,
        //       `/accept-invitation/${id}`
        //     ).toString(),
        //   });
        // },
      }),
      emailOTP({
        sendVerificationOTP: callbacks.sendVerificationOTP,
        // async sendVerificationOTP({ email, otp, type }) {
        //   logger.debug(
        //     {
        //       email,
        //       otp,
        //       type,
        //     },
        //     "Sending verification OTP"
        //   );
        //   const db = dbConfig[0];
        //   const user = await db.query.user.findFirst({
        //     where: (users, { eq }) => eq(users.email, email),
        //   });
        //   logger.debug(user, "User found");
        //   if (!user) {
        //     logger.debug(
        //       {
        //         email,
        //       },
        //       "User not found"
        //     );
        //     throw new Error("User not found");
        //   }

        //   if (type === "email-verification") {
        //     logger.debug("Sending email verification");
        //     await sendNotification("email-verification", {
        //       name: user.name,
        //       email: user.email,
        //       verifyButtonLink: fullUrl(
        //         env.BASE_URL,
        //         "/login",
        //         new URLSearchParams({
        //           email: user.email,
        //           name: firstName(user.name),
        //           code: otp,
        //         })
        //       ).toString(),
        //       code: otp,
        //     });
        //     return;
        //   }

        //   if (type === "forget-password") {
        //     logger.debug("Sending forgot password");
        //     await sendNotification("forgot-password", {
        //       name: user.name,
        //       email: user.email,
        //       resetButtonLink: fullUrl(
        //         env.BASE_URL,
        //         "/forget-password",
        //         new URLSearchParams({
        //           email: user.email,
        //           name: firstName(user.name),
        //           code: otp,
        //         })
        //       ).toString(),
        //       code: otp,
        //     });
        //   }
        // },
      }),
      apiKey(),
    ],
  });
