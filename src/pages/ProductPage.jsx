import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
    ArrowLeft, Heart, Star, ChevronDown, ChevronUp, ShieldCheck, CheckCircle2,
    Clock, ThumbsUp, Sparkles, CheckCircle, Info, TrendingUp,
    MessageCircle, X, Send, Bot, MoreHorizontal
} from 'lucide-react';
import './ProductPage.css';
import ProductCard from './ProductCard';

// ── DİNAMİK GERÇEK PLATFORM RENK HARİTASI ──
const PLATFORM_THEMES = {
    'trendyol': { main: '#F27A1A', light: '#fff4eb' },
    'trendyolgo': { main: '#0cc167', light: '#e8faef' },
    'yemeksepeti': { main: '#EA004B', light: '#ffeef3' },
    'googlemaps': { main: '#4285F4', light: '#e8f0fe' },
    'airbnb': { main: '#FF5A5F', light: '#ffeeef' },
    'hepsiburada': { main: '#FF6000', light: '#fff4eb' },
    'steam': { main: '#2A475E', light: '#f1f5f9' },
    'etstur': { main: '#009FDF', light: '#f0f9ff' },
    'ciceksepeti': { main: '#028139', light: '#f0fdf4' },
    'default': { main: '#8b5cf6', light: '#f5f3ff' }
};

const CATEGORY_DETAILS = {
    'Yemek & Gıda': [
        { key: 'lezzet', label: 'Lezzet Oranı', score: 4.8, icon: ThumbsUp, desc: 'Kullanıcı yorumlarının genel analizi sos dengesi ve malzeme tazeliğini başarılı buluyor.' },
        { key: 'hiz', label: 'Teslimat Hızı', score: 4.2, icon: Clock, desc: 'Siparişlerin ortalama varış süresi lojistik standartlara tam uyum sağlıyor.' },
        { key: 'kurye', label: 'Kurye & Paketleme', score: 4.5, icon: CheckCircle2, desc: 'Sıcaklığı koruyan özel ambalaj yapısı ve kurye memnuniyeti yüksek.' }
    ],
    'Elektronik & Teknoloji': [
        { key: 'ses', label: 'Ses Kalitesi & ANC', score: 4.9, icon: ThumbsUp, desc: 'Aktif gürültü engelleme performansı ve bas dengesi üst düzeyde raporlanmış.' },
        { key: 'pil', label: 'Pil Ömrü & Şarj', score: 4.7, icon: Clock, desc: 'Tek şarjla uzun süreli kesintisiz kullanım verisi doğrulanmış durumda.' },
        { key: 'ergonomi', label: 'Ergonomi & Konfor', score: 4.6, icon: ShieldCheck, desc: 'Kulak yastıklarının kafa yapısına tam uyum sağladığı belirtilmiş.' }
    ],
    default: [
        { key: 'fp', label: 'Fiyat / Performans', score: 4.5, icon: ThumbsUp, desc: 'Harcanan bütçenin karşılığını verimlilik bazında optimum eğride karşılıyor.' },
        { key: 'kalite', label: 'Genel Kalite Algısı', score: 4.4, icon: ShieldCheck, desc: 'Kullanıcı deneyimi standartların üzerinde, güvenilir bir his uyandırıyor.' }
    ]
};

// Ürünün tüm yorumlarını barındıran veri kaynağı
const MOCK_XAI_COMMENTS = {
    1: [
        { id: 101, user: "Ah*** K***", text: "Hayatımda gördüğüm en iyi gürültü engelleme teknolojisine sahip. Müzik dinlerken ses kalitesi muazzam berrak." },
        { id: 102, user: "Ze*** T***", text: "Ses harika ancak uzun kullanımda kulaklarımda ağrı yaptı. Konfor ve ergonomi bence zayıf." },
        { id: 103, user: "Ca*** M***", text: "Fiyatına göre inanılmaz bir konfor sunuyor, kesinlikle öneririm." },
        { id: 104, user: "Bu*** S***", text: "Ses dengesi mükemmel, baslar ve tizler birbirine karışmıyor." }
    ],
    3: [
        { id: 301, user: "Se*** B***", text: "Burger köftesi sıcacık geldi. Gerçekten tam bir lezzet şöleni, porsiyon büyüklüğü çok tatmin edici." },
        { id: 302, user: "Be*** G***", text: "Yemek tam 1 saatte ulaştı. Teslimat süresi ve hız performansı korkunç derecede yavaş." },
        { id: 303, user: "Oğ*** D***", text: "Lezzet harikaydı, kurye de çok kibardı. Teşekkürler." }
    ],
    'default': [
        { id: 901, user: "Ku*** A***", text: "Genel olarak performansı çok iyi ve kalitesi yüksek, kesinlikle tavsiye ederim. Havuz ve çocuklu aileler için harika." },
        { id: 902, user: "Ku*** B***", text: "Kargo hızı harika, ürün beklediğimden de iyi çıktı." },
        { id: 903, user: "Ku*** C***", text: "Açık büfe yemek çeşitliliği zengin ama odalar biraz küçüktü." }
    ]
};

function ProductPage({ product, isFav, onFav, onClose, userRating, onRate, allProducts = [], openProduct, favorites = [], ratings = {} }) {
    const [hoveredStar, setHoveredStar] = useState(0);
    const [expandedParam, setExpandedParam] = useState(null);
    const [selectedWord, setSelectedWord] = useState(null);
    const [hoveredWord, setHoveredWord] = useState(null);

    // Chatbot States
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [chatMessages, setChatMessages] = useState([
        { sender: 'ai', text: `Merhaba! Ben VividAI Asistan. 👋 ${product?.name} hakkında merak ettiklerini bana sorabilirsin.` }
    ]);
    const [chatInput, setChatInput] = useState('');
    const chatEndRef = useRef(null);

    useEffect(() => {
        if (isChatOpen && chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatMessages, isChatOpen, isTyping]);

    if (!product) return null;

    const getPlatformTheme = (platName) => {
        if (!platName) return PLATFORM_THEMES['default'];
        const str = platName.toLowerCase().replace(/\s+/g, '');
        if (str.includes('trendyolgo')) return PLATFORM_THEMES['trendyolgo'];
        if (str.includes('trendyol')) return PLATFORM_THEMES['trendyol'];
        if (str.includes('yemeksepeti')) return PLATFORM_THEMES['yemeksepeti'];
        if (str.includes('google')) return PLATFORM_THEMES['googlemaps'];
        if (str.includes('airbnb')) return PLATFORM_THEMES['airbnb'];
        if (str.includes('hepsiburada')) return PLATFORM_THEMES['hepsiburada'];
        if (str.includes('steam')) return PLATFORM_THEMES['steam'];
        if (str.includes('etstur')) return PLATFORM_THEMES['etstur'];
        if (str.includes('çiçeksepeti') || str.includes('ciceksepeti')) return PLATFORM_THEMES['ciceksepeti'];
        return PLATFORM_THEMES['default'];
    };

    const activeTheme = getPlatformTheme(product.plat);

    // Gereksiz/etkisiz kelimeleri filtreleme
    const cleanToken = (word) => word.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();
    const isStopWord = (word) => ['ve', 'veya', 'da', 'de', 'bir', 'bu', 'için', 'en', 'ile', 'o', 'ise', 'içinde', 'çok', 'daha', 'gibi'].includes(cleanToken(word));

    const aiModelScore = useMemo(() => (product.avgScore - 0.2).toFixed(1), [product.avgScore]);
    const varianceScore = useMemo(() => {
        const diff = Math.abs(product.avgScore - aiModelScore);
        return Math.min(94, Math.max(8, (diff * 40) + 12)).toFixed(0);
    }, [product.avgScore, aiModelScore]);

    const similarProducts = useMemo(() => {
        return allProducts
            .filter((p) => p.category === product.category && p.id !== product.id)
            .slice(0, 6);
    }, [allProducts, product.category, product.id]);

    const params = CATEGORY_DETAILS[product.category] || CATEGORY_DETAILS.default;
    // Sağ tarafta her zaman GÖRÜNECEK kaynak yorumların tamamı
    const sourceComments = MOCK_XAI_COMMENTS[product.id] || MOCK_XAI_COMMENTS.default;
    const summaryWords = useMemo(() => product.sum.split(/\s+/), [product.sum]);

    const handleWordClick = (word) => {
        const clean = cleanToken(word);
        if (isStopWord(clean)) return;
        setSelectedWord(selectedWord === clean ? null : clean);
    };

    // Chatbot Mesaj Gönderimi
    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        const newUserMsg = { sender: 'user', text: chatInput };
        setChatMessages(prev => [...prev, newUserMsg]);
        setChatInput('');
        setIsTyping(true);

        setTimeout(() => {
            setIsTyping(false);
            setChatMessages(prev => [...prev, {
                sender: 'ai',
                text: `Analizlerimize göre "${newUserMsg.text}" konusunda kullanıcılar genel olarak olumlu bir eğilim gösteriyor.`
            }]);
        }, 1500);
    };

    // SOL TARAF (ÖZET) İÇİN KELİME RENDER FONKSİYONU
    const renderInteractiveSummary = (textArray) => {
        return textArray.map((word, idx) => {
            const clean = cleanToken(word);
            const stopWord = isStopWord(word);
            const isGlow = !stopWord && (hoveredWord === clean || selectedWord === clean);
            const isLocked = !stopWord && selectedWord === clean;

            return (
                <span
                    key={idx}
                    className={`tc-dynamic-word ${isGlow ? 'active' : ''} ${isLocked ? 'locked' : ''} ${stopWord ? 'stop-word' : ''}`}
                    onMouseEnter={() => { if (!stopWord) setHoveredWord(clean); }}
                    onMouseLeave={() => { setHoveredWord(null); }}
                    onClick={() => handleWordClick(word)}
                >
                    {word}{' '}
                </span>
            );
        });
    };

    // SAĞ TARAFTAKİ YORUMLAR İÇİNDE METNİ VURGULAMA FONKSİYONU
    const renderHighlightedCommentText = (text, targetWord) => {
        if (!targetWord) return text;

        // Cümledeki hedef kelimeyi büyük/küçük harf duyarsız bul ve böl
        const regex = new RegExp(`(${targetWord})`, 'gi');
        const parts = text.split(regex);

        return parts.map((part, i) =>
            part.toLowerCase() === targetWord.toLowerCase() ?
                <span key={i} className="tc-word-highlight-match">{part}</span> : part
        );
    };

    // Şu anda aktif olan (hover edilen veya tıklanan) kelime
    const activeTargetWord = hoveredWord || selectedWord;

    return (
        <div
            className="tc-page-wrapper"
            style={{
                '--theme-main': activeTheme.main,
                '--theme-light': activeTheme.light
            }}
        >
            <div className="tc-top-bar">
                <button className="tc-back-btn" onClick={onClose}>
                    <ArrowLeft size={16} /> Keşif Paneline Dön
                </button>
                <div className="tc-breadcrumb">
                    Anasayfa {'>'} {product.category} {'>'} <span>{product.name}</span>
                </div>
            </div>

            <div className="tc-main-grid">

                {/* 1. SOL: RESİM & AI ÖZETİ */}
                <div className="tc-image-column">
                    <div className="tc-main-image-box">
                        <img src={product.img} alt={product.name} />
                        <div className="tc-image-badges">
                            <span className="tc-badge-ai">VividAI Analizör</span>
                        </div>
                    </div>

                    <div className="tc-ai-summary-box">
                        <div className="tc-ai-summary-header">
                            <Sparkles size={16} color={activeTheme.main} />
                            <strong>{product.plat} Verisi Sentez Raporu</strong>
                        </div>
                        <p className="tc-interactive-text">
                            {renderInteractiveSummary(summaryWords)}
                        </p>
                        <div className="tc-summary-hint">
                            * Özetteki kelimelerin hangi yorumlardan geldiğini görmek için kelimelere tıklayın veya üzerine gelin.
                        </div>
                    </div>
                </div>

                {/* 2. ORTA: DETAYLAR & KAYNAK YORUMLAR KUTUSU */}
                <div className="tc-details-column">
                    <div className="tc-product-header">
                        <h1 className="tc-product-title">
                            <span className="tc-brand">{product.plat}</span> {product.name}
                        </h1>
                        <div className="tc-rating-summary">
                            <div className="tc-stars">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={14} fill={activeTheme.main} color={activeTheme.main} />
                                ))}
                            </div>
                            <span className="tc-rating-count">Platform Puanı: {product.avgScore}</span>
                        </div>
                    </div>

                    <div className="tc-score-cards-row">
                        <div className="tc-score-card">
                            <div className="tc-score-top">
                                <span className="tc-score-val">{aiModelScore}</span>
                                <div className="tc-score-labels">
                                    <strong>VividAI Endeksi</strong>
                                    <span>Anlamsal Model Skoru</span>
                                </div>
                            </div>
                        </div>
                        <div className="tc-score-card">
                            <div className="tc-score-top">
                                <span className="tc-score-val-alt">% {varianceScore}</span>
                                <div className="tc-score-labels">
                                    <strong>Çelişki Oranı</strong>
                                    <span>Yorum Standart Sapması</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="tc-specs-section">
                        <div className="tc-specs-title-group">
                            <TrendingUp size={16} color={activeTheme.main} />
                            <h3 className="tc-section-title">Kategorik Özet Parametreleri</h3>
                        </div>
                        <div className="tc-params-list">
                            {params.map((p) => {
                                const IconComp = p.icon;
                                const isExpanded = expandedParam === p.key;
                                return (
                                    <div key={p.key} className={`tc-param-row-wrapper ${isExpanded ? 'active-row' : ''}`}>
                                        <div className="tc-param-clickable-row" onClick={() => setExpandedParam(isExpanded ? null : p.key)}>
                                            <div className="tc-param-left">
                                                <div className="tc-icon-frame">{IconComp && <IconComp size={14} />}</div>
                                                <span className="tc-param-label">{p.label}</span>
                                            </div>
                                            <div className="tc-param-right">
                                                <div className="tc-progress-bg">
                                                    <div className="tc-progress-fill" style={{ width: `${(p.score / 5) * 100}%` }}></div>
                                                </div>
                                                <span className="tc-param-score">{p.score}</span>
                                                {isExpanded ? <ChevronUp size={16} color={activeTheme.main} /> : <ChevronDown size={16} color="#64748b" />}
                                            </div>
                                        </div>
                                        {isExpanded && (
                                            <div className="tc-param-expanded-content">
                                                <p className="tc-expanded-text">{p.desc}</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* VURGULAMA VE HARİTALAMA (HIGHLIGHT) YAPILAN YORUM KUTUSU */}
                    <div className="tc-reviews-section">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                            <h3 className="tc-section-title" style={{ margin: 0 }}>Özeti Oluşturan Kaynak Yorumlar</h3>
                            {selectedWord && (
                                <button className="tc-clear-filter" onClick={() => setSelectedWord(null)}>
                                    Seçimi Temizle
                                </button>
                            )}
                        </div>

                        <div className="tc-reviews-scroll-box">
                            {sourceComments.map(review => {
                                // Arama işlemini küçük harfe çevirerek yapıyoruz
                                const textLower = review.text.toLocaleLowerCase('tr-TR');
                                const targetLower = activeTargetWord ? activeTargetWord.toLocaleLowerCase('tr-TR') : '';

                                // Yorumun içinde aktif kelime geçiyor mu?
                                const isMatch = activeTargetWord && textLower.includes(targetLower);

                                // Stil sınıfı ataması: Aktif kelime varsa ve yorum içeriyorsa öne çıkar, içermiyorsa soluklaştır.
                                let cardStateClass = '';
                                if (activeTargetWord) {
                                    cardStateClass = isMatch ? 'tc-card-highlight' : 'tc-card-dimmed';
                                }

                                return (
                                    <div key={review.id} className={`tc-review-card-mini ${cardStateClass}`}>
                                        <div className="tc-review-header-mini">
                                            <span className="tc-review-user-masked">{review.user}</span>
                                        </div>
                                        <p className="tc-interactive-text-mini">
                                            {/* Eşleşme varsa kelimeyi sarı/tema rengi ile vurgula, yoksa düz metni bas */}
                                            {activeTargetWord && isMatch
                                                ? renderHighlightedCommentText(review.text, activeTargetWord)
                                                : review.text}
                                        </p>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                </div>

                {/* 3. SAĞ: SATICI VE AKSİYONLAR */}
                <div className="tc-action-column">
                    <div className="tc-seller-box">
                        <div className="tc-seller-header">
                            <span className="tc-seller-name">{product.plat}</span>
                            <span className="tc-seller-badge"><CheckCircle size={12} /> Orijinal Kaynak</span>
                        </div>
                        <div className="tc-seller-info-row">
                            <Info size={14} color={activeTheme.main} />
                            <span>Bu analiz, {product.plat} üzerindeki açık veriler kullanılarak oluşturulmuştur.</span>
                        </div>
                    </div>

                    <a href={product.productUrl} target="_blank" rel="noreferrer" className="tc-btn-primary">
                        Mağazaya Git ve İncele
                    </a>

                    <button className={`tc-btn-secondary ${isFav ? 'fav-active' : ''}`} onClick={() => onFav(product)}>
                        <Heart size={16} fill={isFav ? activeTheme.main : 'none'} color={isFav ? activeTheme.main : '#475569'} />
                        {isFav ? 'Koleksiyona Eklendi' : 'Koleksiyona Ekle'}
                    </button>

                    <div className="tc-rate-box">
                        <strong>Model Çıktısını Değerlendir</strong>
                        {userRating ? (
                            <div className="tc-rate-success">Geri Bildirim Alındı ({userRating} Yıldız)</div>
                        ) : (
                            <div className="tc-rate-stars">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                        key={s} size={20}
                                        fill={hoveredStar >= s ? activeTheme.main : 'none'}
                                        color={hoveredStar >= s ? activeTheme.main : '#cbd5e1'}
                                        onMouseEnter={() => setHoveredStar(s)}
                                        onMouseLeave={() => setHoveredStar(0)}
                                        onClick={() => onRate(product.id, s)}
                                        style={{ cursor: 'pointer', transition: 'transform 0.1s' }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ========================================================= */}
            {/* 4. ALT KISIM: BENZER ÜRÜNLER (YATAY SCROLL) */}
            {/* ========================================================= */}
            <div className="tc-similar-section">
                <h2 className="tc-similar-title">Kategorideki Benzer Ürünler</h2>
                <div className="tc-similar-scroll-container">
                    {similarProducts.map(item => (
                        <div key={item.id} className="tc-similar-card-wrapper">
                            <ProductCard
                                item={item}
                                isFav={favorites.some((f) => f.id === item.id)}
                                onFav={onFav}
                                onClick={() => {
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                    openProduct(item);
                                }}
                                userRating={ratings[item.id]}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* CHATBOT FAB (Yüzen Buton) */}
            <button className={`tc-chatbot-fab ${isChatOpen ? 'hidden' : ''}`} onClick={() => setIsChatOpen(true)}>
                <Bot size={28} />
            </button>

            {/* MODAL PENCERESİ */}
            <div className={`tc-chatbot-modal ${isChatOpen ? 'open' : ''}`}>
                <div className="tc-chatbot-header">
                    <div className="tc-chatbot-header-left">
                        <div className="tc-bot-avatar-container">
                            <Bot size={22} />
                            <div className="tc-bot-online-dot"></div>
                        </div>
                        <div className="tc-chatbot-title-box">
                            <span className="tc-chatbot-title">VividAI Asistan</span>
                            <span className="tc-chatbot-subtitle">Sizin için burada</span>
                        </div>
                    </div>
                    <button className="tc-chatbot-close" onClick={() => setIsChatOpen(false)}>
                        <X size={20} />
                    </button>
                </div>

                <div className="tc-chatbot-body">
                    <div className="tc-chat-disclaimer">
                        Gerçek zamanlı AI analiz asistanı ile görüşüyorsunuz.
                    </div>
                    {chatMessages.map((msg, idx) => (
                        <div key={idx} className={`tc-chat-bubble ${msg.sender}`}>
                            {msg.text}
                        </div>
                    ))}

                    {isTyping && (
                        <div className="tc-chat-bubble ai typing">
                            <MoreHorizontal size={20} className="tc-typing-icon" />
                        </div>
                    )}

                    <div ref={chatEndRef} />
                </div>

                <form className="tc-chatbot-footer" onSubmit={handleSendMessage}>
                    <input
                        type="text"
                        placeholder="Bir şeyler sorun..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                    />
                    <button type="submit" disabled={!chatInput.trim()} className={chatInput.trim() ? 'active' : ''}>
                        <Send size={18} />
                    </button>
                </form>
            </div>

        </div>
    );
}

export default ProductPage;