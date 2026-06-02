import React from 'react';
import { Heart, Star } from 'lucide-react';
import './ProductCard.css';

function ProductCard({ item, isFav, onFav, onClick, userRating }) {
    return (
        <div className="p-card" onClick={onClick}>
            <button
                className={`p-fav-btn ${isFav ? 'active' : ''}`}
                onClick={(e) => {
                    e.stopPropagation();
                    onFav(item);
                }}
            >
                <Heart
                    size={14}
                    fill={isFav ? '#ef4444' : 'none'}
                    color={isFav ? '#ef4444' : '#94a3b8'}
                />
            </button>

            <div className="p-img-wrap">
                <img
                    src={item.img}
                    alt={item.name}
                    className="p-img"
                    onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/180x180/111027/8b5cf6?text=N/A';
                    }}
                />
            </div>

            <div className="p-body">
                <div className="p-plat">{item.plat}</div>
                <h4 className="p-name">{item.name}</h4>
                <div className="p-footer">
                    <span className="p-cat">{item.category}</span>
                    <span className="p-score">
                        <Star size={11} fill="#f59e0b" color="#f59e0b" />
                        {' '}{userRating || item.avgScore}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default ProductCard;
