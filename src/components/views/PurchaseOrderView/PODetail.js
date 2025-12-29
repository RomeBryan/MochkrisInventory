import React, { useState } from "react";
import {
  X,
  Download,
  Check,
  Truck,
  Star,
  CheckCircle,
  ArrowLeft,
  Printer,
  Mail,
  FileText,
  Clock,
  User,
  AlertCircle,
} from "lucide-react";
import POStatusBadge from "./POStatusBadge";

export default function PODetail({
  po,
  currentUser,
  onBack,
  onAction,
  suppliers = [],
}) {
  const [showConfirm, setShowConfirm] = useState(null);

  const totalAmount = po.items?.reduce((sum, item) => {
    return sum + item.quantity * (item.unitPrice || 0);
  }, 0);

  const tax = totalAmount * 0.12;
  const grandTotal = totalAmount + tax;

  const canApprove = po.status === "draft" && currentUser.role === "OWNER";
  const canMarkPurchased =
    po.status === "approved" && currentUser.role === "MANAGER";
  const canReceive =
    ["purchased", "partially_received"].includes(po.status) &&
    currentUser.role === "MANAGER";
  const canRate =
    po.status === "completed" &&
    !po.supplierRated &&
    currentUser.role === "MANAGER";
  const canEdit = po.status === "draft" && currentUser.role === "OWNER";

  const handleReceive = () => {
    const allItemsReceived = po.items.every(
      (item) => (item.receivedQty || 0) >= item.quantity
    );

    const someItemsReceived = po.items.some(
      (item) => (item.receivedQty || 0) > 0
    );

    if (!someItemsReceived) {
      alert("Please enter received quantities for at least one item");
      return;
    }

    const status = allItemsReceived ? "completed" : "partially_received";
    onAction("receive", { ...po, status });
  };

  const handleAction = (action) => {
    if (action === "receive") {
      handleReceive();
    } else {
      onAction(action, po);
    }
  };

  const getSupplierName = (supplierId) => {
    const supplier = suppliers.find((s) => s.id === supplierId);
    return supplier ? supplier.name : "Unknown Supplier";
  };

  const getStatusInfo = (status) => {
    const statusInfo = {
      draft: {
        icon: <FileText className="h-5 w-5 text-gray-400" />,
        color: "text-gray-400",
        bgColor: "bg-gray-50",
        label: "Draft",
      },
      approved: {
        icon: <CheckCircle className="h-5 w-5 text-blue-500" />,
        color: "text-blue-500",
        bgColor: "bg-blue-50",
        label: "Approved",
      },
      purchased: {
        icon: <Truck className="h-5 w-5 text-purple-500" />,
        color: "text-purple-500",
        bgColor: "bg-purple-50",
        label: "Purchased",
      },
      partially_received: {
        icon: <AlertCircle className="h-5 w-5 text-yellow-500" />,
        color: "text-yellow-500",
        bgColor: "bg-yellow-50",
        label: "Partially Received",
      },
      completed: {
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
        color: "text-green-500",
        bgColor: "bg-green-50",
        label: "Completed",
      },
      rejected: {
        icon: <X className="h-5 w-5 text-red-500" />,
        color: "text-red-500",
        bgColor: "bg-red-50",
        label: "Rejected",
      },
    };

    return statusInfo[status] || statusInfo.draft;
  };

  const statusInfo = getStatusInfo(po.status);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="mr-4 p-1 rounded-full hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5 text-gray-500" />
            </button>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Purchase Order #{po.poNumber || po.id.slice(0, 8).toUpperCase()}
              </h2>
              <div className="flex items-center mt-1">
                <div
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}
                >
                  {statusInfo.icon}
                  <span className="ml-1">{statusInfo.label}</span>
                </div>
                <span className="mx-2 text-gray-300">•</span>
                <span className="text-sm text-gray-500">
                  Created on {new Date(po.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => window.print()}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
              title="Print PO"
            >
              <Printer className="h-5 w-5" />
            </button>
            <button
              onClick={() => {}}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
              title="Email PO"
            >
              <Mail className="h-5 w-5" />
            </button>
            <button
              onClick={() => {}}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
              title="Download PDF"
            >
              <Download className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Supplier and Delivery Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">SUPPLIER</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium">{getSupplierName(po.supplierId)}</p>
              {po.supplier?.contact && (
                <p className="text-sm text-gray-600 mt-1">
                  {po.supplier.contact}
                </p>
              )}
              {po.supplier?.email && (
                <p className="text-sm text-gray-600">{po.supplier.email}</p>
              )}
              {po.supplier?.rating ? (
                <div className="mt-2 flex items-center">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= po.supplier.rating
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-1 text-xs text-gray-500">
                    ({po.supplier.rating}/5)
                  </span>
                </div>
              ) : (
                <div className="mt-2 text-xs text-gray-500">No ratings yet</div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">DELIVERY</h3>
            <div className="bg-gray-50 p-4 rounded-lg h-full">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-5 w-5 text-gray-400">
                  <Truck className="h-5 w-5" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {po.expectedDelivery
                      ? new Date(po.expectedDelivery).toLocaleDateString()
                      : "Not specified"}
                  </p>
                  <p className="text-sm text-gray-500">Expected Delivery</p>
                </div>
              </div>

              {po.purchaseDate && (
                <div className="mt-4 flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-gray-400">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(po.purchaseDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">Purchased on</p>
                  </div>
                </div>
              )}

              {po.receivedDate && (
                <div className="mt-4 flex items-start">
                  <div className="flex-shrink-0 h-5 w-5 text-gray-400">
                    <Check className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(po.receivedDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">Received on</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">DETAILS</h3>
            <div className="bg-gray-50 p-4 rounded-lg h-full">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">PO Number</p>
                  <p className="text-sm font-medium">
                    {po.poNumber || po.id.slice(0, 8).toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Created By</p>
                  <p className="text-sm font-medium">
                    {po.createdBy?.name || currentUser.name}
                  </p>
                </div>
                {po.approvedBy && (
                  <div>
                    <p className="text-xs text-gray-500">Approved By</p>
                    <p className="text-sm font-medium">{po.approvedBy.name}</p>
                  </div>
                )}
                {po.assignedTo && (
                  <div>
                    <p className="text-xs text-gray-500">Assigned To</p>
                    <p className="text-sm font-medium">{po.assignedTo.name}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-500 mb-3">ITEMS</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Item
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Unit Price
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Qty
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Total
                  </th>
                  {canReceive && (
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Received
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {po.items?.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.description || "No description"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₱{parseFloat(item.unitPrice || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.quantity} {item.unit || "pcs"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₱{(item.quantity * (item.unitPrice || 0)).toFixed(2)}
                    </td>
                    {canReceive && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <input
                            type="number"
                            min="0"
                            max={item.quantity - (item.receivedQty || 0)}
                            value={item.receivedQty || 0}
                            className="w-20 p-1 border rounded text-sm text-center"
                            onChange={(e) => {
                              const receivedQty = Math.min(
                                Math.max(0, parseInt(e.target.value) || 0),
                                item.quantity - (item.receivedQty || 0)
                              );

                              const updatedItems = [...po.items];
                              updatedItems[index] = {
                                ...updatedItems[index],
                                receivedQty,
                              };
                              onAction("updateReceivedQty", {
                                ...po,
                                items: updatedItems,
                              });
                            }}
                          />
                          <span className="ml-2 text-xs text-gray-500">
                            / {item.quantity} {item.unit || "pcs"}
                          </span>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td
                    colSpan={canReceive ? 3 : 2}
                    className="px-6 py-3 text-right text-sm font-medium text-gray-500"
                  >
                    Subtotal
                  </td>
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">
                    ₱{totalAmount.toFixed(2)}
                  </td>
                  {canReceive && <td></td>}
                </tr>
                <tr>
                  <td
                    colSpan={canReceive ? 3 : 2}
                    className="px-6 py-3 text-right text-sm font-medium text-gray-500"
                  >
                    Tax (12%)
                  </td>
                  <td className="px-6 py-3 text-sm font-medium text-gray-900">
                    ₱{tax.toFixed(2)}
                  </td>
                  {canReceive && <td></td>}
                </tr>
                <tr>
                  <td
                    colSpan={canReceive ? 3 : 2}
                    className="px-6 py-3 text-right text-sm font-bold text-gray-900"
                  >
                    Total
                  </td>
                  <td className="px-6 py-3 text-sm font-bold text-gray-900">
                    ₱{grandTotal.toFixed(2)}
                  </td>
                  {canReceive && <td></td>}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Notes */}
        {po.notes && (
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-500 mb-2">NOTES</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700 whitespace-pre-line">
                {po.notes}
              </p>
            </div>
          </div>
        )}

        {/* History */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-3">HISTORY</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flow-root">
              <ul className="-mb-8">
                {po.history?.map((event, index) => (
                  <li key={index}>
                    <div className="relative pb-8">
                      {index !== po.history.length - 1 ? (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span
                            className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                              getStatusInfo(event.status).bgColor
                            }`}
                          >
                            {getStatusInfo(event.status).icon}
                          </span>
                        </div>
                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                          <div>
                            <p className="text-sm text-gray-800">
                              <span className="font-medium">
                                {event.userName || "System"}
                              </span>{" "}
                              {getStatusInfo(event.status).label.toLowerCase()}{" "}
                              this PO
                              {event.notes && (
                                <span className="text-gray-500">
                                  : {event.notes}
                                </span>
                              )}
                            </p>
                          </div>
                          <div className="whitespace-nowrap text-right text-sm text-gray-500">
                            <time dateTime={event.timestamp}>
                              {new Date(event.timestamp).toLocaleString()}
                            </time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-wrap justify-between items-center gap-4">
        <div className="space-x-3">
          <button
            onClick={onBack}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Back to List
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </button>
        </div>

        <div className="space-x-3">
          {canApprove && (
            <>
              <button
                onClick={() => handleAction("approve")}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4 mr-2" />
                Approve & Assign
              </button>
              <button
                onClick={() => handleAction("reject")}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                <X className="h-4 w-4 mr-2" />
                Reject
              </button>
            </>
          )}

          {canMarkPurchased && (
            <button
              onClick={() => handleAction("markPurchased")}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark as Purchased
            </button>
          )}

          {canReceive && (
            <button
              onClick={() => handleAction("receive")}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Truck className="h-4 w-4 mr-2" />
              {po.status === "partially_received"
                ? "Update Receipt"
                : "Receive Items"}
            </button>
          )}

          {canRate && (
            <button
              onClick={() => onAction("rateSupplier", po)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600"
            >
              <Star className="h-4 w-4 mr-2" />
              Rate Supplier
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Dialogs */}
      {showConfirm === "approve" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Approve Purchase Order</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to approve this purchase order? This action
              cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleAction("approve");
                  setShowConfirm(null);
                }}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirm === "reject" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Reject Purchase Order</h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to reject this purchase order? This action
              cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleAction("reject");
                  setShowConfirm(null);
                }}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
