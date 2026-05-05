import os
import psycopg2
import json
import time
from dotenv import load_dotenv
from google import genai  # Yeni SDK
from psycopg2.extras import RealDictCursor

# .env dosyasını yükle
load_dotenv()

# Yapılandırma
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=GEMINI_API_KEY)

# Gemini 3 Flash: Hem çok ucuz hem de inanılmaz hızlı
MODEL_NAME = 'models/gemini-3.1-flash-lite-preview'
db_config = {
    "dbname": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "host": os.getenv("DB_HOST"),
    "port": os.getenv("DB_PORT")
}

def gemini_puanla(yorum_metni):
    prompt = f"""
    Aşağıdaki kullanıcı yorumunu analiz et. 
    Metindeki duygu durumuna göre 1 ile 5 arasında bir puan ver.
    1: Çok Kötü, 2: Kötü, 3: Nötr, 4: İyi, 5: Mükemmel.
    
    KURAL: Sadece tek bir rakam döndür. Başka kelime yazma.
    
    Yorum: "{yorum_metni}"
    """
    try:
        # Yeni SDK formatı: client.models.generate_content
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt
        )
        puan = response.text.strip()
        return int(puan) if puan.isdigit() else None
    except Exception as e:
        print(f"⚠️ API Hatası: {e}")
        return None

def etiketleme_operasyonu():
    etiketli_veriler = []
    dosya_adi = "etiketli_egitim_verisi.json"

    # Eğer önceden kalma bir dosya varsa oradan devam etmek için (isteğe bağlı)
    if os.path.exists(dosya_adi):
        with open(dosya_adi, "r", encoding="utf-8") as f:
            try:
                etiketli_veriler = json.load(f)
                print(f"📂 Mevcut dosya bulundu, {len(etiketli_veriler)} veriden devam ediliyor...")
            except: pass

    try:
        conn = psycopg2.connect(**db_config)
        cur = conn.cursor(cursor_factory=RealDictCursor)

        sql = """
        WITH RankedReviews AS (
            SELECT p.product_name, p.platform, r.clean_text, r.rating_int,
            ROW_NUMBER() OVER (PARTITION BY r.rating_int ORDER BY RANDOM()) as sira
            FROM reviews r
            JOIN products p ON r.product_id = p.id
            WHERE r.clean_text IS NOT NULL 
              AND length(r.clean_text) > 10 
              AND r.rating_int > 0
        )
        SELECT product_name, platform, clean_text, rating_int as orijinal_puan
        FROM RankedReviews WHERE sira <= 1000;
        """

        cur.execute(sql)
        rows = cur.fetchall()
        print(f"✅ {len(rows)} veri veritabanından çekildi. İşlem başlıyor...")

        for i, row in enumerate(rows):
            # Eğer bu yorumu daha önce etiketlediysek atlayabiliriz (Basit bir kontrol)
            # (Gelişmiş projelerde hash kontrolü yapılır)

            ai_puani = gemini_puanla(row['clean_text'])

            if ai_puani is not None:
                etiketli_veriler.append({
                    "urun_adi": row['product_name'],
                    "platform": row['platform'],
                    "yorum": row['clean_text'],
                    "orijinal_puan": row['orijinal_puan'],
                    "gemini_puani": ai_puani
                })

            # İlerleme Logu ve Her 50 veride bir yedekleme (Auto-Save)
            if i % 50 == 0 and i > 0:
                print(f"📊 İlerleme: %{(i/len(rows)*100):.1f} | Etiketlenen: {len(etiketli_veriler)}")
                with open(dosya_adi, "w", encoding="utf-8") as f:
                    json.dump(etiketli_veriler, f, ensure_ascii=False, indent=4)

            # API Rate Limit için bekleme (Flash için 0.1-0.2 yeterli)
            time.sleep(0.1)

        # Final Kaydı
        with open(dosya_adi, "w", encoding="utf-8") as f:
            json.dump(etiketli_veriler, f, ensure_ascii=False, indent=4)

        print(f"🎉 İşlem başarıyla tamamlandı. Toplam {len(etiketli_veriler)} veri kaydedildi.")

    except Exception as e:
        print(f"❌ Hata: {e}")
    finally:
        if 'conn' in locals():
            cur.close()
            conn.close()

if __name__ == "__main__":
    etiketleme_operasyonu()