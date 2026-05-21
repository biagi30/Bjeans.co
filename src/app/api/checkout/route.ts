import mongoose from "mongoose";
import { connectDatabase } from "@/backend/config/db";
import { Cart, Order } from "@/backend/models";
import { validateBody, checkoutSchema } from "@/backend/utils/validate";
import { successResponse, errorResponse } from "@/backend/utils/apiResponse";

function generateOrderNumber(prefix: string) {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export async function POST(request: Request) {
  try {
    await connectDatabase();
    const body = await request.json().catch(() => ({}));
    const { error, value } = validateBody<any>(checkoutSchema, body);

    if (error) {
      return errorResponse(error, 400);
    }

    const { cartId, shippingAddress = "" } = value;

    const cart = await Cart.findById(cartId).populate("user");

    if (!cart) {
      return errorResponse("Cart not found", 404);
    }

    if (!cart.items.length) {
      return errorResponse("Cart is empty", 400);
    }

    const retailItems = cart.items.filter((item: any) => item.itemType === "retail");
    const customItems = cart.items.filter((item: any) => item.itemType === "custom");
    const computedTotal = cart.items.reduce(
      (sum: number, item: any) => sum + item.totalPrice,
      0
    );

    if (computedTotal <= 0) {
      return errorResponse("Cart total is invalid", 400);
    }

    if (cart.totalAmount !== computedTotal) {
      cart.totalAmount = computedTotal;
      await cart.save();
    }

    const unifiedOrder = await Order.create({
      orderNumber: generateOrderNumber("UNF"),
      orderType: "unified",
      customer: cart.user,
      items: cart.items,
      status: "waiting_payment",
      paymentStatus: "unpaid",
      shippingAddress,
      totalAmount: computedTotal,
    });

    const splitOrders = [];

    if (retailItems.length) {
      const retailTotal = retailItems.reduce(
        (sum: number, item: any) => sum + item.totalPrice,
        0
      );
      splitOrders.push(
        await Order.create({
          orderNumber: generateOrderNumber("RTL"),
          orderType: "retail",
          parentOrder: unifiedOrder._id,
          customer: cart.user,
          items: retailItems,
          status: "waiting_payment",
          paymentStatus: "unpaid",
          shippingAddress,
          totalAmount: retailTotal,
        })
      );
    }

    if (customItems.length) {
      const customTotal = customItems.reduce(
        (sum: number, item: any) => sum + item.totalPrice,
        0
      );
      splitOrders.push(
        await Order.create({
          orderNumber: generateOrderNumber("CST"),
          orderType: "custom",
          parentOrder: unifiedOrder._id,
          customer: cart.user,
          items: customItems,
          status: "waiting_payment",
          paymentStatus: "unpaid",
          shippingAddress,
          totalAmount: customTotal,
        })
      );
    }

    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    return successResponse({
      unifiedOrder,
      splitOrders,
    });
  } catch (err: any) {
    return errorResponse(err.message, 500);
  }
}
export const dynamic = "force-dynamic";
