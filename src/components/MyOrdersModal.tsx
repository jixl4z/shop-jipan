"use client";

import React, { useEffect, useState } from "react";
import { useStore } from "@/context/StoreContext";
import { X, Package, Copy, Check, Calendar, Loader2 } from "lucide-react";

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
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    addToast("คัดลอกข้อมูลสินค้าแล้ว!", "info");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={closeMyOrders}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl rounded-3xl bg-neutral-900 border border-neutral-800 p-6 sm:p-7 shadow-2xl z-10 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white">
              <Package className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">คลังสินค้าของฉัน (My Inventory)</h2>
              <p className="text-xs text-neutral-400">
                รายการสินค้าและรหัสสินค้าดิจิทัลทั้งหมดที่คุณเคยสั่งซื้อ
              </p>
            </div>
          </div>
          <button
            onClick={closeMyOrders}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-neutral-400 text-xs">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
              <span>กำลังโหลดประวัติการสั่งซื้อ...</span>
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
              const isCopied = copiedId === o.id;
              const formattedDate = new Date(o.createdAt).toLocaleString("th-TH", {
                dateStyle: "medium",
                timeStyle: "short",
              });

              return (
                <div
                  key={o.id}
                  className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-mono text-neutral-500">
                        {o.orderNumber}
                      </div>
                      <div className="font-bold text-sm text-white">{o.productName}</div>
                      <div className="text-[11px] text-neutral-400 flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3 h-3 text-neutral-500" />
                        <span>{formattedDate}</span>
                        <span>•</span>
                        <span className="font-mono font-semibold text-emerald-400">
                          ฿{o.totalAmount.toFixed(2)} ({o.quantity} ชิ้น)
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCopy(o.id, o.deliveredData)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs font-medium transition-colors shrink-0 cursor-pointer"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">คัดลอกแล้ว</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>คัดลอกรหัส</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Delivered Secret Box */}
                  <pre className="p-3 rounded-xl bg-neutral-900 border border-neutral-800/80 text-emerald-400 font-mono text-xs whitespace-pre-wrap break-all select-all">
                    {o.deliveredData}
                  </pre>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
