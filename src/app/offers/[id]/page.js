import offers from "../../../data/offers.json";
import Image from "next/image";


export default function OfferDetailPage({ params }) {
  const offer = offers.find((item) => item.id.toString() === params.id);

  if (!offer) {
    return <div className="p-6 text-center text-red-600">Offer not found</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">{offer.title}</h1>
      <Image src={offer.image} alt={offer.title} className="w-full max-w-md mb-4" />
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
