import type {
  SubscriberArgs,
  SubscriberConfig,
} from "@medusajs/framework"
import { Modules } from "@medusajs/framework/utils"
import { INotificationModuleService } from "@medusajs/framework/types"

interface ChefEventData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  notes?: string;
  requestedDate: string;
  requestedTime: string;
  productName: string;
}

export default async function chefEventHandler({
  event: { data },
  container,
}: SubscriberArgs<ChefEventData>) {
  const notificationModuleService: INotificationModuleService =
    container.resolve(Modules.NOTIFICATION)

  const emailContent = `
🎉 Hey Chef! You have a new booking request!
------------------------------------------
From: ${data.firstName} ${data.lastName}
Email: ${data.email}
${data.phone ? `Phone: ${data.phone}` : 'No phone provided'}
------------------------------------------
Date: ${data.requestedDate}
Time: ${data.requestedTime}
Menu: ${data.productName}
${data.notes ? `\nSpecial Requests:\n${data.notes}` : 'No special requests'}
------------------------------------------
  `;

  await notificationModuleService.createNotifications({
    to: "pablo_3@icloud.com",
    channel: "email",
    template: "new-chef-bookingsd",
    data: {
      text: emailContent,
      html: emailContent.replace(/\n/g, '<br>'),
    },
  })
}

export const config: SubscriberConfig = {
  event: "chef-event.created",
} 