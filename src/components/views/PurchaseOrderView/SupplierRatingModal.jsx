import React, { useState } from "react";
import { X, Star, Truck, Package, DollarSign } from "lucide-react";

export default function SupplierRatingModal({ po, onRate, onClose }) {
  const [deliveryRating, setDeliveryRating] = useState(5);
  const [qualityRating, setQualityRating] = useState(5);
  const [priceRating, setPriceRating] = useState(5);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!deliveryRating || !qualityRating || !priceRating) {
      alert("Please provide all ratings");
      return;
    }

    setIsSubmitting(true);
    try {
      await onRate({
        delivery_rating: deliveryRating,
        quality_rating: qualityRating,
        price_rating: priceRating,
        notes: notes || null,
      });
      onClose();
    } catch (error) {
      console.error("Error submitting rating:", error);
      alert(`Error submitting rating: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const RatingSection = ({ title, icon, rating, setRating, description }) => (
    <div className="mb-6">
      <div className="flex items-center mb-2">
        {icon}
        <label className="block text-sm font-medium text-gray-700 ml-2">
          {title}
        </label>
      </div>
      <div className="flex items-center justify-center space-x-1 mb-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className="focus:outline-none"
            disabled={isSubmitting}
          >
            <Star
              className={`h-6 w-6 ${
                star <= rating
                  ? "text-yellow-400 fill-current"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
      {description && (
        <p className="text-xs text-gray-500 text-center">{description}</p>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Rate Supplier</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isSubmitting}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Rate Supplier: {po.supplier?.name || "Unknown"}
            </h4>

            <RatingSection
              title="Delivery Performance"
              icon={<Truck className="h-5 w-5 text-gray-600" />}
              rating={deliveryRating}
              setRating={setDeliveryRating}
              description="On-time delivery and handling"
            />

            <RatingSection
              title="Quality"
              icon={<Package className="h-5 w-5 text-gray-600" />}
              rating={qualityRating}
              setRating={setQualityRating}
              description="Product quality and condition"
            />

            <RatingSection
              title="Price Compliance"
              icon={<DollarSign className="h-5 w-5 text-gray-600" />}
              rating={priceRating}
              setRating={setPriceRating}
              description="Price accuracy and competitiveness"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Additional Notes (optional)
            </label>
            <textarea
              id="notes"
              rows="3"
              className="w-full p-2 border rounded-md text-sm"
              placeholder="Any additional feedback about this supplier..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                isSubmitting
                  ? "bg-indigo-400"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Rating"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
