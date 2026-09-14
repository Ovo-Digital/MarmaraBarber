import type { Customer } from "@/types/customer";
import { T } from "@/lib/i18n/dil";
import {
  formatOrderDate,
  formatOrderNumber,
  formatOrderStatus,
  formatOrderTotal,
} from "./account-utils";

interface AccountOrdersProps {
  customer: Customer;
}

export function AccountOrders({ customer }: AccountOrdersProps) {
  return (
    <div>
      <h2 className="mb-6 border-b border-[#e0e0e0] pb-4 text-[15px] font-semibold"><T k="Orders" /></h2>

      {customer.orders.length === 0 ? (
        <p className="py-12 text-center text-[12px] text-[#666]"><T k="You have no orders yet." /></p>
      ) : (
        <>
          <div className="hidden border-b border-[#e0e0e0] pb-3 text-[11px] font-semibold sm:grid sm:grid-cols-[1.2fr_1fr_1fr_1fr_auto] sm:gap-4">
            <span><T k="Order number" /></span>
            <span><T k="Status" /></span>
            <span><T k="Date" /></span>
            <span><T k="Total" /></span>
            <span className="sr-only">Details</span>
          </div>

          <ul>
            {customer.orders.map((order) => (
              <li
                key={order.orderNumber}
                className="grid gap-3 border-b border-[#e0e0e0] py-5 text-[12px] sm:grid-cols-[1.2fr_1fr_1fr_1fr_auto] sm:items-center sm:gap-4"
              >
                <div>
                  <p className="sm:hidden text-[10px] font-semibold uppercase text-[#999] mb-1">Order</p>
                  <p className="font-medium break-all">{formatOrderNumber(order.orderNumber)}</p>
                </div>
                <div>
                  <p className="sm:hidden text-[10px] font-semibold uppercase text-[#999] mb-1">Status</p>
                  <p><T k={formatOrderStatus(order.financialStatus, order.fulfillmentStatus)} /></p>
                </div>
                <div>
                  <p className="sm:hidden text-[10px] font-semibold uppercase text-[#999] mb-1">Date</p>
                  <p>{formatOrderDate(order.processedAt)}</p>
                </div>
                <div>
                  <p className="sm:hidden text-[10px] font-semibold uppercase text-[#999] mb-1">Total</p>
                  <p className="font-medium">{formatOrderTotal(order.totalPrice, order.currencyCode)}</p>
                </div>
                <div className="sm:text-right">
                  <a
                    href={order.statusUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pf-btn-primary inline-flex w-auto px-4 !py-2.5 !text-[10px] whitespace-nowrap"
                  >
                    <T k="View order" />
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
