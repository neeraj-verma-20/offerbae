import offers from "../../../data/offers.json";
import Image from "next/image";


export default function OfferDetailPage({ params }) {
  const offer = offers.find((item) => item.id.toString() === params.id);

  if (!offer) {
    return <div className="p-6 text-center text-red-600">Offer not found</div>;
  }

  const hasImage = typeof offer.image === 'string' && offer.image.trim() !== '';

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">{offer.title}</h1>
      {hasImage ? (
        <div className="relative w-64 h-64 mb-4">
          <Image src={offer.image} alt={offer.title} fill className="object-cover rounded" />
        </div>
      ) : (
        <div className="w-64 h-64 mb-4 rounded bg-gray-100 border flex items-center justify-center text-gray-400">No Image</div>
      )}
      <p className="text-lg">{offer.description}</p>
      <a
        href={offer.googleMapLink}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-500 underline block mt-4"
      >
        📍 View on Google Maps
      </a>
    </div>
  );
}
