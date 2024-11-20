import { z } from "zod"

export const formDataFromRequest = async <T>(request: T extends Request ? T : never) => request.clone().formData().catch(() => new FormData())

export const parsedFormDataFromRequest = async <T, Y>(request: T extends Request ? T : never, formSchema: Y extends z.ZodTypeAny ? Y : never) => formSchema.parse(await formDataFromRequest(request))

