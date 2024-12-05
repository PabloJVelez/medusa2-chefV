import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { INotificationModuleService } from "@medusajs/framework/types"

interface EventRequest {
  productId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  notes?: string;
  requestedDate: string;
  requestedTime: string;
  productName: string;
}

export async function POST(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  try {
    const eventData = req.body as EventRequest;
    
    const notificationService: INotificationModuleService = req.scope.resolve(Modules.NOTIFICATION);

    const response = await notificationService.createNotifications({
      to: "pabsv003@gmail.com",
      channel: "email",
      template: "d-c693ecebe49048d88e46d4dc26d30a19",
      data: {
        customer: {
          first_name: eventData.firstName,
          last_name: eventData.lastName,
          email: eventData.email,
          phone: eventData.phone || 'No phone provided'
        },
        booking: {
          date: eventData.requestedDate,
          time: eventData.requestedTime,
          menu: eventData.productName,
          notes: eventData.notes || 'No special requests'
        }
      }
    });

    console.log("RESPONSE FROM NOTIFICATION SERVICE ------->>>>>>>>>", response);

    res.status(200).json({
      success: true,
      message: "Booking request received",
      data: {
        requestId: `req_${Date.now()}`,
        status: "pending",
        customerName: `${eventData.firstName} ${eventData.lastName}`,
        eventDetails: {
          date: eventData.requestedDate,
          time: eventData.requestedTime,
          productName: eventData.productName
        }
      },
    });
  } catch (error) {
    console.error('Error creating chef event:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}