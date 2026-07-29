import { FaStar, FaRegStar } from "react-icons/fa";

export function StarRating({ filmId, currentRating, onRatingChange }) {
  return (
    <div className="flex gap-1 mt-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className="cursor-pointer text-yellow-500 hover:scale-125 transition-transform"
          onClick={() => onRatingChange(filmId, star === currentRating ? 0 : star)}
          title={`Vota ${star} stell${star === 1 ? "a" : "e"}`}
        >
          {star <= (currentRating || 0) ? (
            <FaStar className="h-3 w-3 sm:h-4 sm:w-4 drop-shadow-sm" />
          ) : (
            <FaRegStar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground/40" />
          )}
        </span>
      ))}
    </div>
  );
}