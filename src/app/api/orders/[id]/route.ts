import { connectDatabase } from "@/backend/config/db";
import { Order, Product } from "@/backend/models";
import {
  validateBody,
  orderUpdateSchema,
  isValidObjectId,
} from "@/backend/utils/validate";
import { successResponse, errorResponse } from "@/backend/utils/apiResponse";
import {
  kirimNotifikasiPesananDiproses,
  kirimNotifikasiPesananDikirim,
  kirimNotifikasiPesananSelesai,
} from "@/backend/services/whatsappService";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!isValidObjectId(id)) {
      return errorResponse("Invalid id parameter", 400);
    }

    await connectDatabase();
    const order = await Order.findById(id).populate("customer");

    if (!order) {
      return errorResponse("Order not found", 404);
    }

    return successResponse(order);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!isValidObjectId(id)) {
      return errorResponse("Invalid id parameter", 400);
    }

    await connectDatabase();
    const body = await request.json().catch(() => ({}));
    const { error, value } = validateBody<any>(orderUpdateSchema, body);

    if (error) {
      return errorResponse(error, 400);
    }

    const updateData = { ...value };
    // Auto-fill updatedBy if it's sent in body
    if (body.updatedBy) {
      updateData.updatedBy = body.updatedBy;
    }

    const order = await Order.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("customer");

    if (!order) {
      return errorResponse("Order not found", 404);
    }

    // ─── Kirim Notifikasi WhatsApp (fire-and-forget) ───
    // Hanya kirim jika status berubah ke "processing", "shipped", atau "done" dan customer punya nomor telepon
    if (value.status && order.customer && (order.customer as any).phone) {
      const customer = order.customer as any;
      const orderData = {
        orderNumber: order.orderNumber,
        customerName: customer.name || "Pelanggan",
        items: order.items.map((item: any) => ({
          name: item.name,
          quantity: item.quantity,
          totalPrice: item.totalPrice,
        })),
        totalAmount: order.totalAmount,
        shippingAddress: order.shippingAddress,
      };

      if (value.status === "processing") {
        kirimNotifikasiPesananDiproses(customer.phone, orderData).catch((err) =>
          console.error("[WhatsApp] Gagal kirim notifikasi pesanan diproses:", err.message)
        );
      } else if (value.status === "shipped") {
        kirimNotifikasiPesananDikirim(customer.phone, orderData).catch((err) =>
          console.error("[WhatsApp] Gagal kirim notifikasi pesanan dikirim:", err.message)
        );
      } else if (value.status === "done") {
        kirimNotifikasiPesananSelesai(customer.phone, orderData).catch((err) =>
          console.error("[WhatsApp] Gagal kirim notifikasi pesanan selesai:", err.message)
        );
      }
    }

    return successResponse(order);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!isValidObjectId(id)) {
      return errorResponse("Invalid id parameter", 400);
    }

    await connectDatabase();
    
    // Find the order first to restore stock
    const order = await Order.findById(id);
    if (!order) {
      return errorResponse("Order not found", 404);
    }

    // Restore stock for retail items if the order is unpaid
    if (order.paymentStatus === "unpaid") {
      for (const item of order.items) {
        if (item.itemType === "retail" && item.product) {
          const product = await Product.findById(item.product);
          const hasSizes = product && product.sizes && product.sizes.length > 0;
          const selectedSize = item.customSpec?.size;

          if (hasSizes && selectedSize) {
            await Product.updateOne(
              { _id: item.product, "sizes.size": selectedSize },
              {
                $inc: {
                  "sizes.$.stock": item.quantity,
                  stock: item.quantity
                }
              }
            );
          } else {
            await Product.findByIdAndUpdate(item.product, {
              $inc: { stock: item.quantity }
            });
          }
        }
      }
    }

    // Delete the order
    await Order.findByIdAndDelete(id);

    return successResponse({ message: "Order deleted and stock restored" });
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}
export const dynamic = "force-dynamic";
