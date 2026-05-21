import SafeImage from "./SafeImage";

const MenuItemCard = ({ item, onAdd, dealHighlight }) => {
  const displayImage = item.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600";

  return (
    <div
      id={`menu-item-${item.id}`}
      className={`bg-white rounded-2xl border shadow-[0_4px_15px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)] transition-all duration-300 flex flex-col sm:flex-row overflow-hidden group h-full ${
        dealHighlight
          ? "border-[var(--color-brand)] ring-2 ring-[var(--color-brand)]/40 ring-offset-2 hover:border-[var(--color-brand)]"
          : "border-gray-100 hover:border-pink-100"
      }`}
    >
      <div className="w-full sm:w-[150px] h-44 sm:h-auto overflow-hidden shrink-0 bg-gray-50 relative">
        <SafeImage src={displayImage} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      <div className="p-4 sm:p-5 flex-grow flex flex-col justify-between">
        <div>
          <h4 className="text-lg font-extrabold text-gray-900 group-hover:text-[var(--color-brand)] transition-colors leading-tight tracking-tight">{item.name}</h4>
          <p className="text-gray-500 text-sm mt-1.5 line-clamp-2 font-medium leading-snug">{item.description || "Tasty, fresh, and made just for you with the finest ingredients."}</p>
        </div>
        <div className="flex items-center justify-between mt-5 pt-3 border-t border-gray-50">
          <span className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">Rs {Number(item.price).toFixed(2)}</span>
          <button 
            onClick={() => onAdd(item)}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-pink-50 text-[var(--color-brand)] hover:bg-[var(--color-brand)] hover:text-white transition-all duration-300 flex items-center justify-center shadow-sm border border-pink-100 hover:border-[var(--color-brand)] focus:ring-4 focus:ring-pink-100 transform active:scale-90 cursor-pointer"
            aria-label="Add to cart"
          >
            <i className="fa-solid fa-plus text-sm"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;
