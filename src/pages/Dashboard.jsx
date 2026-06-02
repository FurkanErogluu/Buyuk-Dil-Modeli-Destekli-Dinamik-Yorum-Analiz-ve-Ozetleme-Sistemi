import React, { useState, useCallback, useMemo } from 'react';
import {
    Search, Zap, Link2, ClipboardPaste, BarChart,
    LayoutGrid, Cpu, Shirt, UtensilsCrossed, Hotel,
    Sparkles, Dumbbell, BookOpen, Flower2, Baby,
    Car, Music, LogOut, TrendingUp, Clock, Heart,
    ChevronRight, Compass, FileText, Users, ChartNoAxesColumnIncreasing
} from 'lucide-react';
import './Dashboard.css';
import ProductCard from './ProductCard';
import ProductModal from './ProductModal';
import { dbGet, dbSet, STORAGE_KEYS } from './storage';

/* ── VERİ ── */
const MOCK_PRODUCTS = [
    {
        id: 1,
        name: 'Sony WH-1000XM5',
        category: 'Elektronik',
        plat: 'Amazon',
        avgScore: 4.9,
        img: 'https://m.media-amazon.com/images/I/61lBYijrBBL._AC_SL1500_.jpg',
        productUrl: 'https://amazon.com',
        sum: 'Gürültü engelleme ve ses kalitesi kullanıcılar tarafından övgüyle karşılanmış. Uzun süreli kullanımda konfor ön plana çıkmış.',
    },
    {
        id: 2,
        name: 'Kaşmir Palto',
        category: 'Moda',
        plat: 'Trendyol',
        avgScore: 4.5,
        img: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400',
        productUrl: 'https://trendyol.com',
        sum: 'Kumaş kalitesi ve kesimi konusunda müşteriler çok memnun. Beden uyumu genel olarak doğru bulunmuş.',
    },
    {
        id: 3,
        name: 'Gurme Burger',
        category: 'Yemek',
        plat: 'Yemeksepeti',
        avgScore: 4.4,
        img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
        productUrl: 'https://yemeksepeti.com',
        sum: 'Lezzet ve porsiyon büyüklüğü konusunda yorumlar oldukça olumlu. Teslimat süresi de beğeni toplamış.',
    },
    {
        id: 4,
        name: 'Logitech MX Master 3',
        category: 'Elektronik',
        plat: 'Amazon',
        avgScore: 4.9,
        img: 'https://m.media-amazon.com/images/I/61ni3t1ryQL._AC_SL1500_.jpg',
        productUrl: 'https://amazon.com',
        sum: 'Verimlilik odaklı kullanıcılar için en çok önerilen fare. Ergonomi ve hassasiyet öne çıkan özellikler.',
    },
    {
        id: 5,
        name: 'AirPods Pro 2',
        category: 'Elektronik',
        plat: 'Amazon',
        avgScore: 4.8,
        img: 'https://m.media-amazon.com/images/I/6SUj2aKoEL._AC_SL1500_.jpg',
        productUrl: 'https://amazon.com',
        sum: 'Aktif gürültü engelleme özelliği öne çıkan yorum konusu olmuş. Ses kalitesi beklentileri karşılıyor.',
    },
    {
        id: 6,
        name: 'Çiçek Elbise',
        category: 'Moda',
        plat: 'Trendyol',
        avgScore: 4.3,
        img: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400',
        productUrl: 'https://trendyol.com',
        sum: 'Desen ve kumaş tercih edilen özellikler arasında. Renk gerçeğe uygunluğu beğenilmiş.',
    },
    {
        id: 7,
        name: 'Bali Villa Otel',
        category: 'Otel',
        plat: 'Booking',
        avgScore: 4.7,
        img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400',
        productUrl: 'https://booking.com',
        sum: 'Manzara ve personel hizmet kalitesi yüksek puan almış. Kahvaltı seçenekleri de beğenilmiş.',
    },
    {
        id: 8,
        name: 'Margherita Pizza',
        category: 'Yemek',
        plat: 'Yemeksepeti',
        avgScore: 4.6,
        img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
        productUrl: 'https://yemeksepeti.com',
        sum: 'Geleneksel tarif ve taze malzemeler için övgüler alınmış. Hamur kıvamı özellikle beğenilmiş.',
    },
];

/* ── GÜNCEL KATEGORİ LİSTESİ (Sayılar Kaldırıldı) ── */
const CATEGORIES = [
    { label: 'Hepsi', icon: LayoutGrid },
    { label: 'Yemek & Gıda', icon: UtensilsCrossed },
    { label: 'Ev & Yaşam', icon: Hotel },
    { label: 'Elektronik & Teknoloji', icon: Cpu },
    { label: 'Moda', icon: Shirt },
    { label: 'Otel & Konaklama', icon: Hotel },
    { label: 'Kozmetik & Kişisel Bakım', icon: Sparkles },
    { label: 'Hediyelik Eşya', icon: Heart },
    { label: 'Hobi, Kitap & Kırtasiye', icon: BookOpen },
    { label: 'Oyun & Eğlence', icon: Music },
    { label: 'Çiçek & Yenilebilir Çiçek', icon: Flower2 },
    { label: 'Spor & Outdoor', icon: Dumbbell },
    { label: 'Anne, Bebek & Oyuncak', icon: Baby },
    { label: 'Sağlık', icon: Sparkles },
    { label: 'Otomobil', icon: Car },
    { label: 'Pet Shop', icon: Heart },
    { label: 'Hizmet & Kurumsal', icon: FileText },
    { label: 'Gezilecek Yerler', icon: Compass },
    { label: 'Diğer', icon: LayoutGrid },
];

/* ── DASHBOARD ── */
export default function Dashboard() {
    const [tab, setTab] = useState('kesfet');
    const [category, setCategory] = useState('Hepsi');
    const [searchQ, setSearchQ] = useState('');
    const [selected, setSelected] = useState(null);
    const [favorites, setFavorites] = useState(() => dbGet(STORAGE_KEYS.favorites) ?? []);
    const [ratings, setRatings] = useState(() => dbGet(STORAGE_KEYS.ratings) ?? {});
    const [history, setHistory] = useState(() => dbGet(STORAGE_KEYS.history) ?? []);
    const [searchCounts, setSearchCounts] = useState(() => dbGet(STORAGE_KEYS.searches) ?? {});

    /* Favori toggle */
    const toggleFav = useCallback((item) => {
        setFavorites((prev) => {
            const exists = prev.some((f) => f.id === item.id);
            const next = exists ? prev.filter((f) => f.id !== item.id) : [...prev, item];
            dbSet(STORAGE_KEYS.favorites, next);
            return next;
        });
    }, []);

    /* Puanlama */
    const handleRate = useCallback((productId, score) => {
        setRatings((prev) => {
            const next = { ...prev, [productId]: score };
            dbSet(STORAGE_KEYS.ratings, next);
            return next;
        });
    }, []);

    /* Arama kaydı ── GÜVENLİ VE DÜZELTİLMİŞ HALİ */
    const recordSearch = useCallback((term) => {
        // 1. Önce history state'ini güvenli bir şekilde güncelle ve bitir
        setHistory((prev) => {
            const next = [term, ...prev.filter((h) => h !== term)].slice(0, 20);
            dbSet(STORAGE_KEYS.history, next);
            return next;
        });

        // 2. Ayrı bir bağımsız blok olarak arama sayısını güncelle
        setSearchCounts((prev) => {
            const next = { ...prev, [term]: (prev[term] || 0) + 1 };
            dbSet(STORAGE_KEYS.searches, next);
            return next;
        });
    }, []); // Bağımlılık dizisi temiz kalıyor

    const handleSearch = () => { if (searchQ.trim()) recordSearch(searchQ.trim()); };
    const openProduct = (item) => { recordSearch(item.name); setSelected(item); };

    /* Filtreli ürünler */
    const filteredProducts = useMemo(() =>
        MOCK_PRODUCTS.filter((p) => {
            if (category === 'Hepsi') return true;
            // Eğer ürünün kategorisi seçilen label ile tam eşleşiyorsa göster
            return p.category === category;
        }),
        [category, searchQ]
    );

    /* Trend sıralaması */
    const topSearched = useMemo(() =>
        Object.entries(searchCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([name, count]) => ({ name, count })),
        [searchCounts]
    );

    return (

        <div className="vivid-main-page">

            <div className="bg-animation-layer">
                <div className="blob blue"></div>
                <div className="blob pink"></div>
                <div className="grid-overlay"></div>
            </div>
            {/* ── NAV ── */}
            <header className="vivid-top-nav">
                <div className="nav-glow-capsule">

                    {/* GÜNCEL LOGO VE SLOGAN YAPISI */}
                    <div className="vivid-brand-container">
                        <div className="vivid-logo-box">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="url(#paint0_linear)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M8 9H16" stroke="white" strokeWidth="2" strokeLinecap="round" />
                                <path d="M8 13H13" stroke="white" strokeWidth="2" strokeLinecap="round" />
                                <circle cx="17.5" cy="12.5" r="2" fill="#ec4899" className="pulse-dot" />
                                <defs>
                                    <linearGradient id="paint0_linear" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#a855f7" />
                                        <stop offset="1" stopColor="#ec4899" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                        <div className="vivid-title-group">
                            <div className="vivid-brand-text">Vivid<span className="ai-glow-text">AI</span></div>
                            <div className="vivid-brand-slogan">YAPAY ZEKA ANALİZ MOTORU</div>
                        </div>
                    </div>

                    <div className="vivid-user-profile">
                        <span className="user-name-display">Nisanur Cebecioğlu</span>
                        <div className="user-avatar-circle">N</div>
                        <button className="vivid-btn-exit">
                            {React.createElement(LogOut, { size: 13 })} Çıkış
                        </button>
                    </div>
                </div>
            </header>

            {/* ── HERO ── */}
            <section className="vivid-hero-section">
                <div className="hero-top">
                    <div className="hero-text">
                        <h1>Analiz Portalına<br /><span>Hoş Geldin</span></h1>
                        <p>Ürün linkini yapıştır, AI ile anında analiz et</p>
                    </div>
                    <div className="hero-stats">
                        <div className="stat-box">
                            <div className="s-num">12.4K</div>
                            <div className="s-label">Analiz Edildi</div>
                        </div>
                        <div className="stat-box">
                            <div className="s-num">4.8</div>
                            <div className="s-label">Ort. Puan</div>
                        </div>
                        <div className="stat-box">
                            <div className="s-num">98%</div>
                            <div className="s-label">Doğruluk</div>
                        </div>
                    </div>
                </div>

                {/* Arama */}
                <div className="search-glow-wrap">
                    <div className="search-inner-box">
                        <Search size={18} className="search-icon" />
                        <input
                            className="search-input-field"
                            placeholder="Ürün linki yapıştır veya isim ile ara..."
                            value={searchQ}
                            onChange={(e) => setSearchQ(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                        />
                        <button className="search-action-btn" onClick={handleSearch}>
                            <Zap size={14} /> Analiz Et
                        </button>
                    </div>
                </div>

                {/* Adım akışı */}
                <div className="flow-steps-row">
                    <div className="flow-step-unit">
                        <div className="flow-icon-box"><Link2 size={20} /></div>
                        <div className="flow-text">
                            <div className="flow-title">Link'i Kopyala</div>
                            <div className="flow-desc">Ürün sayfasından URL al</div>
                        </div>
                    </div>
                    <ChevronRight size={18} className="flow-arrow" />
                    <div className="flow-step-unit">
                        <div className="flow-icon-box"><ClipboardPaste size={20} /></div>
                        <div className="flow-text">
                            <div className="flow-title">Yapıştır</div>
                            <div className="flow-desc">Arama kutusuna ekle</div>
                        </div>
                    </div>
                    <ChevronRight size={18} className="flow-arrow" />
                    <div className="flow-step-unit">
                        <div className="flow-icon-box">
                            <ChartNoAxesColumnIncreasing size={20} />
                        </div>
                        <div className="flow-text">
                            <div className="flow-title">Sonuçları Gör</div>
                            <div className="flow-desc">AI analiz raporunu incele</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── KATEGORİLER ── */}
            <div className="cat-section">
                <div className="cat-section-title">Kategoriler</div>
                <div className="cat-row">
                    {CATEGORIES.map((c) => {

                        const CurrentIcon = c.icon;

                        return (
                            <button
                                key={c.label}
                                className={`cat-pill ${category === c.label ? 'active' : ''}`}
                                onClick={() => setCategory(c.label)}
                            >
                                {CurrentIcon && <CurrentIcon size={14} />}
                                {c.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── TAB BAR ── */}
            <div className="tab-bar">
                <button
                    className={`tab-btn ${tab === 'kesfet' ? 'active' : ''}`}
                    onClick={() => setTab('kesfet')}
                >
                    <Compass size={14} /> Keşfet
                </button>
                <button
                    className={`tab-btn ${tab === 'favoriler' ? 'active' : ''}`}
                    onClick={() => setTab('favoriler')}
                >
                    <Heart size={14} /> Favorilerim
                </button>
                <button
                    className={`tab-btn ${tab === 'gecmis' ? 'active' : ''}`}
                    onClick={() => setTab('gecmis')}
                >
                    <Clock size={14} /> Geçmiş & Trendler
                </button>
            </div>

            {/* ── KEŞFET ── */}
            {tab === 'kesfet' && (
                <>
                    <div className="vivid-section">
                        <div className="section-heading">
                            <LayoutGrid size={16} color="#8b5cf6" /> Ürünler
                        </div>
                        {filteredProducts.length === 0 ? (
                            <div className="empty-state">
                                <Search size={32} />
                                <br />Bu kategoride ürün bulunamadı.
                            </div>
                        ) : (
                            <div className="card-grid">
                                {filteredProducts.map((item) => (
                                    <ProductCard
                                        key={item.id}
                                        item={item}
                                        isFav={favorites.some((f) => f.id === item.id)}
                                        onFav={toggleFav}
                                        onClick={() => openProduct(item)}
                                        userRating={ratings[item.id]}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {topSearched.length > 0 && (
                        <div className="vivid-section">
                            <div className="section-heading">
                                <TrendingUp size={16} color="#8b5cf6" /> En Çok Aranan
                            </div>
                            <div className="trend-pills-wrap">
                                {topSearched.map((s, i) => (
                                    <div key={i} className="trend-pill">
                                        <span className="rank">#{i + 1}</span>
                                        <span className="t-name">{s.name}</span>
                                        <span className="count">{s.count}x</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* ── FAVORİLER ── */}
            {tab === 'favoriler' && (
                <div className="vivid-section">
                    <div className="section-heading">
                        <Heart size={16} color="#8b5cf6" /> Favori Ürünlerim
                    </div>
                    {favorites.length === 0 ? (
                        <div className="empty-state">
                            <Heart size={32} />
                            <br />Henüz favori ürünün yok.
                            <br />Ürünleri inceleyerek favorilere ekleyebilirsin.
                        </div>
                    ) : (
                        <div className="card-grid">
                            {favorites.map((item) => (
                                <ProductCard
                                    key={item.id}
                                    item={item}
                                    isFav={true}
                                    onFav={toggleFav}
                                    onClick={() => openProduct(item)}
                                    userRating={ratings[item.id]}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ── GEÇMİŞ & TRENDLER ── */}
            {tab === 'gecmis' && (
                <div className="vivid-section">
                    <div className="section-heading">
                        <Clock size={16} color="#8b5cf6" /> Geçmiş Aramalar
                    </div>
                    {history.length === 0 ? (
                        <div className="empty-state">
                            <Clock size={32} />
                            <br />Henüz arama geçmişin yok.
                        </div>
                    ) : (
                        <div className="history-pills-wrap">
                            {history.map((h, i) => (
                                <div
                                    key={i}
                                    className="history-pill"
                                    onClick={() => { setSearchQ(h); setTab('kesfet'); }}
                                >
                                    <Search size={12} />
                                    {h}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="section-heading" style={{ marginTop: 32 }}>
                        <TrendingUp size={16} color="#8b5cf6" /> Trend Sıralaması
                    </div>
                    {topSearched.length === 0 ? (
                        <div className="empty-state">
                            <BarChart size={32} />
                            <br />Henüz istatistik yok.
                        </div>
                    ) : (
                        topSearched.map((s, i) => (
                            <div key={i} className="trend-row">
                                <span className="t-rank">#{i + 1}</span>
                                <span className="t-name">{s.name}</span>
                                <span className="t-badge">{s.count} arama</span>
                                <div className="trend-bar-wrap">
                                    <div
                                        className="trend-bar"
                                        style={{
                                            width: Math.min(100,
                                                (s.count / (topSearched[0].count || 1)) * 100
                                            ) + '%'
                                        }}
                                    />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* ── MODAL ── */}
            {selected && (
                <ProductModal
                    product={selected}
                    isFav={favorites.some((f) => f.id === selected.id)}
                    onFav={toggleFav}
                    onClose={() => setSelected(null)}
                    userRating={ratings[selected.id]}
                    onRate={handleRate}
                />
            )}

            <div style={{ height: 60 }} />
        </div>
    );
}