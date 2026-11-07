"use client";

import React, { useEffect, useState } from "react";
import { useStore } from "@/context/StoreContext";
import { X, Package, Calendar } from "lucide-react";
import DeliveredDataViewer from "./DeliveredDataViewer";

interface OrderRecord {
  id: string;
  orderNumber: string;
  productName: string;
  price: number;
  quantity: number;
  totalAmount: number;
  deliveredData: string;
  status: string;
  createdAt: string;
  product?: {
    image: string;
    slug: string;
  };
}

export default function MyOrdersModal() {
  const { isMyOrdersOpen, closeMyOrders, addToast } = useStore();
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isMyOrdersOpen) {
      setLoading(true);
      fetch("/api/orders/my-orders")
        .then((res) => res.json())
        .then((data) => {
          if (data.orders) setOrders(data.orders);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isMyOrdersOpen]);

  if (!isMyOrdersOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={closeMyOrders}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#0b0c10] border border-white/[0.12] p-4 sm:p-7 shadow-2xl z-10 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-white/[0.08] shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-white shrink-0">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-lg font-bold text-white truncate">
                คลังสินค้าของฉัน (My Inventory)
              </h2>
              <p className="text-[11px] sm:text-xs text-neutral-400 truncate">
                รายการสินค้าและรหัสสินค้าดิจิทัลทั้งหมดที่คุณเคยสั่งซื้อ
              </p>
            </div>
          </div>
          <button
            onClick={closeMyOrders}
            className="p-1.5 sm:p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {loading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2].map((n) => (
                <div
                  key={n}
                  className="p-4 rounded-2xl bg-neutral-900/60 border border-white/[0.05] space-y-3"
                >
                  <div className="w-32 h-4 bg-neutral-800 rounded" />
                  <div className="w-48 h-5 bg-neutral-800 rounded" />
                  <div className="w-full h-16 bg-neutral-950 rounded-xl" />
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center text-neutral-400 space-y-2">
              <Package className="w-10 h-10 text-neutral-600 mx-auto" />
              <div className="text-sm font-semibold text-neutral-300">
                ยังไม่มีรายการสั่งซื้อ
              </div>
              <p className="text-xs text-neutral-500">
                เมื่อคุณซื้อสินค้า รหัสและบัญชีจะถูกเก็บไว้ที่นี่ตลอดเวลา
              </p>
            </div>
          ) : (
            orders.map((o) => {
              const formattedDate = new Date(o.createdAt).toLocaleString("th-TH", {
                dateStyle: "medium",
                timeStyle: "short",
              });

              return (
                <div
                  key={o.id}
                  className="p-4 sm:p-5 rounded-2xl bg-neutral-900/80 border border-white/[0.08] hover:border-white/20 transition-all space-y-3 shadow-lg"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/[0.06]">
                    <div>
                      <div className="text-xs font-mono text-neutral-400">
                        {o.orderNumber}
                      </div>
                      <div className="font-bold text-sm sm:text-base text-white">{o.productName}</div>
                      <div className="text-[11px] text-neutral-400 flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3 h-3 text-neutral-400" />
                        <span>{formattedDate}</span>
                        <span>•</span>
                        <span className="font-mono font-semibold text-white">
                          ฿{o.totalAmount.toFixed(2)} ({o.quantity} ชิ้น)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Smart Delivered Data Viewer */}
                  <DeliveredDataViewer
                    deliveredData={o.deliveredData}
                    quantity={o.quantity}
                    onCopiedToast={(msg) => addToast(msg, "info")}
                  />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
