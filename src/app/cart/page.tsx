"use client";

import { useRouter } from "next/navigation";

export default function CartPage() {
  const router = useRouter();

  // In a real app, you would fetch items from a state management or API here
  const cartItems = [
    { id: "1", name: "Classic Blue Jeans", price: 50.00, quantity: 1 },
    { id: "2", name: "Premium Denim Jacket", price: 80.00, quantity: 1 }
  ];

  const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-8">
      <div className="max-w-4xl mx-auto mt-10 p-6 bg-white dark:bg-gray-800 shadow-md rounded-lg">
        <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
        
        {cartItems.length > 0 ? (
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center border-b pb-4 dark:border-gray-700">
                <div>
                  <h2 className="text-xl font-semibold">{item.name}</h2>
                  <p className="text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                </div>
                <div className="text-lg font-bold">${item.price.toFixed(2)}</div>
              </div>
            ))}
            
            <div className="pt-6 flex justify-between items-center text-2xl font-bold">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => router.push("/checkout")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center py-10">Your cart is empty.</p>
        )}
      </div>
    </div>
  );
}