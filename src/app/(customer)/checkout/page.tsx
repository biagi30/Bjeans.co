"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // In a real app, this would be passed from a context or an API call to get user info/cart
  const total = 130.00; 

  const handlePlaceOrder = () => {
    setLoading(true);
    // Simulate placing an order
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1500);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-8 flex items-center justify-center">
        <div className="max-w-xl text-center p-8 bg-white dark:bg-gray-800 shadow-lg rounded-xl">
          <h1 className="text-4xl font-bold text-green-600 mb-4">Order Placed Successfully!</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">Thank you for your purchase. We are processing your order.</p>
          <button 
            onClick={() => router.push("/")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
          >
            Return to Store
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-8">
      <div className="max-w-3xl mx-auto mt-10 p-6 bg-white dark:bg-gray-800 shadow-md rounded-lg">
        <h1 className="text-3xl font-bold mb-6 border-b pb-4 dark:border-gray-700">Checkout</h1>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="flex justify-between items-center text-lg">
            <span>Total to pay:</span>
            <span className="font-bold">${total.toFixed(2)}</span>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="First Name" className="w-full px-4 py-2 border rounded bg-transparent dark:border-gray-600" />
              <input type="text" placeholder="Last Name" className="w-full px-4 py-2 border rounded bg-transparent dark:border-gray-600" />
            </div>
            <input type="text" placeholder="Address" className="w-full px-4 py-2 border rounded bg-transparent dark:border-gray-600" />
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="City" className="w-full px-4 py-2 border rounded bg-transparent dark:border-gray-600" />
              <input type="text" placeholder="Postal Code" className="w-full px-4 py-2 border rounded bg-transparent dark:border-gray-600" />
            </div>
          </form>
        </div>

        <div className="flex justify-between items-center pt-6 border-t dark:border-gray-700">
          <button 
            onClick={() => router.back()}
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            ← Back to Cart
          </button>
          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition disabled:opacity-50"
          >
            {loading ? "Processing..." : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
}