import { connectDatabase } from "@/backend/config/db";
import { Order } from "@/backend/models";
import { isValidObjectId } from "@/backend/utils/validate";
import { successResponse, errorResponse } from "@/backend/utils/apiResponse";

export async function POST(request: Request) {
  try {
    await connectDatabase();
    
    const body = await request.json().catch(() => ({}));
    const { orderIds = [], shippingFee = 0, serviceFee = 0 } = body;

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return errorResponse("orderIds must be a non-empty array", 400);
    }

    // Validate ObjectIds
    for (const id of orderIds) {
      if (!isValidObjectId(id)) {
        return errorResponse(`Invalid order ID format: ${id}`, 400);
      }
    }

    // Retrieve orders from DB
    const orders = await Order.find({ _id: { $in: orderIds } }).populate("customer");
    if (orders.length === 0) {
      return errorResponse("No orders found for the given IDs", 404);
    }

    // Calculate total amount
    const ordersSubtotal = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const grossAmount = ordersSubtotal + Number(shippingFee) + Number(serviceFee);

    if (grossAmount <= 0) {
      return errorResponse("Invalid transaction total amount", 400);
    }

    // Get customer details from the first order
    const firstOrder = orders[0];
    const customer = firstOrder.customer as any;
    if (!customer) {
      return errorResponse("Customer details not found on order", 400);
    }

    const nameParts = customer.name ? customer.name.split(" ") : ["Guest"];
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || "";

    // Build item details for Midtrans receipt
    const itemDetails: any[] = [];
    orders.forEach((order) => {
      order.items.forEach((item: any, idx: number) => {
        itemDetails.push({
          id: item.product ? item.product.toString() : `custom-${order._id}-${idx}`,
          price: item.unitPrice,
          quantity: item.quantity,
          name: item.name.substring(0, 50),
        });
      });
    });

    if (shippingFee > 0) {
      itemDetails.push({
        id: "shipping-fee",
        price: Number(shippingFee),
        quantity: 1,
        name: "Ongkos Kirim",
      });
    }

    if (serviceFee > 0) {
      itemDetails.push({
        id: "service-fee",
        price: Number(serviceFee),
        quantity: 1,
        name: "Biaya Layanan & Admin",
      });
    }

    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "";
    const isProduction = process.env.NODE_ENV === "production" && !clientKey.startsWith("SB-");
    const midtransUrl = isProduction
      ? "https://app.midtrans.com/snap/v1/transactions"
      : "https://app.sandbox.midtrans.com/snap/v1/transactions";

    const authHeader = `Basic ${Buffer.from(serverKey + ":").toString("base64")}`;

    const midtransPayload = {
      transaction_details: {
        order_id: orderIds.join("-"),
        gross_amount: grossAmount,
      },
      item_details: itemDetails,
      customer_details: {
        first_name: firstName,
        last_name: lastName,
        email: customer.email || "guest@bjeans.co",
        phone: customer.phone || "081234567890",
      },
      credit_card: {
        secure: true,
      },
    };

    const response = await fetch(midtransUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": authHeader,
      },
      body: JSON.stringify(midtransPayload),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("Midtrans API Error response:", responseData);
      return errorResponse(responseData.error_messages?.[0] || "Failed to communicate with Midtrans", 500);
    }

    return successResponse({
      token: responseData.token,
      redirectUrl: responseData.redirect_url,
    });
  } catch (error: any) {
    console.error("Token route error:", error);
    return errorResponse(error.message, 500);
  }
}

export const dynamic = "force-dynamic";
