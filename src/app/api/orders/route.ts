import { connectDatabase } from "@/backend/config/db";
import { Order, Product } from "@/backend/models";
import { validateBody, orderCreateSchema } from "@/backend/utils/validate";
import { successResponse, errorResponse } from "@/backend/utils/apiResponse";

export async function GET(request: Request) {
  try {
    await connectDatabase();
    const { searchParams } = new URL(request.url);
    const customer = searchParams.get("customer");

    const query: any = {};
    if (customer) {
      query.customer = customer;
    }

    const orders = await Order.find(query).sort({ createdAt: -1 }).populate("customer");
    return successResponse(orders);
  } catch (error: any) {
    return errorResponse(error.message, 500);
  }
}

export async function POST(request: Request) {
  try {
    await connectDatabase();
    const body = await request.json().catch(() => ({}));
    const { error, value } = validateBody<any>(orderCreateSchema, body);

    if (error) {
      return errorResponse(error, 400);
    }

    // 1. Validasi ketersediaan stok untuk retail items
    for (const item of value.items) {
      if (item.itemType === "retail" && item.product) {
        const product = await Product.findById(item.product);
        if (!product) {
          return errorResponse(`Produk retail dengan ID ${item.product} tidak ditemukan.`, 404);
        }

        const hasSizes = product.sizes && product.sizes.length > 0;
        const selectedSize = item.customSpec?.size;

        if (hasSizes && selectedSize) {
          const sizeObj = product.sizes.find((s: any) => s.size === selectedSize);
          if (!sizeObj) {
            return errorResponse(
              `Ukuran "${selectedSize}" untuk produk "${product.name}" tidak ditemukan.`,
              400
            );
          }
          if (sizeObj.stock < item.quantity) {
            return errorResponse(
              `Stok untuk "${product.name}" (Ukuran ${selectedSize}) tidak mencukupi. Tersedia: ${sizeObj.stock}, diminta: ${item.quantity}.`,
              400
            );
          }
        } else {
          if (product.stock < item.quantity) {
            return errorResponse(
              `Stok untuk "${product.name}" tidak mencukupi. Tersedia: ${product.stock}, diminta: ${item.quantity}.`,
              400
            );
          }
        }
      }
    }

    // 2. Buat pesanan
    const order = await Order.create(value);

    // 3. Potong stok setelah pesanan berhasil dibuat
    for (const item of value.items) {
      if (item.itemType === "retail" && item.product) {
        const product = await Product.findById(item.product);
        const hasSizes = product && product.sizes && product.sizes.length > 0;
        const selectedSize = item.customSpec?.size;

        if (hasSizes && selectedSize) {
          await Product.updateOne(
            { _id: item.product, "sizes.size": selectedSize },
            {
              $inc: {
                "sizes.$.stock": -item.quantity,
                stock: -item.quantity
              }
            }
          );
        } else {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: -item.quantity }
          });
        }
      }
    }

    return successResponse(order, 201);
  } catch (error: any) {
    console.error("POST /api/orders Error:", error);
    return errorResponse(error.message, 500);
  }
}
export const dynamic = "force-dynamic";
