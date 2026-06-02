import React, { useState } from 'react';
import {
    X,
    Heart,
    Star,
    ExternalLink,
    Zap,
    Package,
    Truck,
    Volume2,
    Battery,
    MapPin,
    Sparkles,
} from 'lucide-react';
import './ProductModal.css';

const HIGHLIGHTS = {
    Elektronik: [
        { icon: Volume2, l: 'Ses Kalitesi', v: 'Mükemmel' },
        { icon: Package, l: 'Malzeme', v: 'Premium' },
        { icon: Battery, l: 'Pil Ömrü', v: '24+ Saat' },
    ],
    Otel: [
        { icon: Sparkles, l: 'Temizlik', v: 'Kusursuz' },
        { icon: MapPin, l: 'Konum', v: 'Merkezi' },
        { icon: Zap, l: 'Hizmet', v: 'Çok Hızlı' },
    ],
    Yemek: [
        { icon: Sparkles, l: 'Lezzet', v: 'Harika' },
        { icon: Package, l: 'Porsiyon', v: 'Dolu' },
        { icon: Truck, l: 'Teslimat', v: 'Hızlı' },
    ],
    Moda: [
        { icon: Sparkles, l: 'Kumaş', v: 'Kaliteli' },
        { icon: Package, l: 'Kesim', v: 'Modern' },
        { icon: Zap, l: 'Renk', v: 'Canlı' },
    ],
    default: [
        { icon: Zap, l: 'Fiyat/Performans', v: 'Dengeli' },
        { icon: Package, l: 'Kullanım', v: 'Pratik' },
        { icon: Truck, l: 'Kargo', v: 'Hızlı' },
    ],
};

function ProductModal({ product, isFav, onFav, onClose, userRating, onRate }) {
    const [hovered, setHovered] = useState(0);

    if (!product || !product.id || !product.category) return null;

    const hl = HIGHLIGHTS[product.category] || HIGHLIGHTS.default;

    return (
        <div className="m-backdrop" onClick={onClose}>
            <div className="m-box" onClick={(e) => e.stopPropagation()}>

                {/* Görsel */}
                <div className="m-img-wrap">
                    <img
                        src={product.img}
                        alt={product.name}
                        className="m-hero-img"
                        onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/480x240/111027/8b5cf6?text=N/A';
                        }}
                    />
                    <div className="m-img-overlay" />
                    <button className="m-close-btn" onClick={onClose}>
                        <X size={16} />
                    </button>
                </div>

                {/* İçerik */}
                <div className="m-scroll">
                    <div className="m-header-row">
                        <div className="m-plat-badge">{product.plat}</div>
                        <button
                            className={`m-fav-btn ${isFav ? 'active' : ''}`}
                            onClick={() => onFav(product)}
                        >
                            <Heart
                                size={14}
                                fill={isFav ? '#ef4444' : 'none'}
                                color={isFav ? '#ef4444' : '#94a3b8'}
                            />
                            {isFav ? 'Favorilerde' : 'Favoriye Ekle'}
                        </button>
                    </div>

                    <h2 className="m-title">{product.name}</h2>
                    <p className="m-subtitle">{product.category} · AI Duygu Analizi</p>
                    <div className="m-divider" />

                    {/* Puanlama */}
                    <div className="m-rating">
                        <p className="m-label">
                            {userRating ? 'DEĞERLENDİRMENİZ ALINDI' : 'ÜRÜNÜ PUANLAYIN'}
                        </p>
                        <div className="m-stars">
                            {[1, 2, 3, 4, 5].map((s) => {
                                const filled = (hovered || userRating) >= s;
                                return (
                                    <span
                                        key={s}
                                        className={`m-star ${userRating ? 'locked' : ''}`}
                                        onMouseEnter={() => { if (!userRating) setHovered(s); }}
                                        onMouseLeave={() => setHovered(0)}
                                        onClick={() => { if (!userRating) onRate(product.id, s); }}
                                    >
                                        <Star
                                            size={26}
                                            fill={filled ? '#f59e0b' : 'none'}
                                            color={filled ? '#f59e0b' : '#334155'}
                                        />
                                    </span>
                                );
                            })}
                        </div>
                    </div>

                    {/* Özellikler */}
                    <div className="m-highlights">
                        <p className="m-label">ÖNE ÇIKAN ÖZELLİKLER</p>
                        <div className="m-hl-grid">
                            {hl.map((h, i) => {
                                const IconComponent = h.icon;
                                return (
                                    <div key={i} className="m-hl-tag">
                                        {/* Sadece IconComponent'i güvenli bir şekilde çağırıyoruz */}
                                        {IconComponent && <IconComponent size={14} color="#8b5cf6" />}
                                        <span className="hl-label">{h.l}</span>
                                        <span className="hl-val">{h.v}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    {/* AI Analiz */}
                    <div className="m-ai-box">
                        <div className="m-ai-header">
                            <Sparkles size={14} color="#8b5cf6" />
                            <p className="m-label" style={{ margin: 0 }}>AI ANALİZ RAPORU</p>
                        </div>
                        <p className="m-ai-text">{product.sum}</p>
                    </div>

                    {/* Mağaza Butonu */}
                    <a
                        href={product.productUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="m-store-btn"
                    >
                        Mağazada Görüntüle
                        <ExternalLink size={14} />
                    </a>
                </div>
            </div>
        </div>
    );
}

export default ProductModal;
