import Head from "next/head";
import styles from "@/styles/Home.module.css";
import { useState, useEffect } from "react";
import Script from "next/script";

export default function Home() {
  const [urls, setUrls] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPopupAd, setShowPopupAd] = useState(false);
  const [currentYear, setCurrentYear] = useState('');

  // Xử lý vấn đề hydration bằng cách tránh render khác biệt giữa server và client
  useEffect(() => {
    // Set năm hiện tại ở client-side để tránh sự khác biệt với server-side
    setCurrentYear(new Date().getFullYear().toString());
    
    // Hiển thị quảng cáo popup sau khi trang tải xong 30 giây
    const timer = setTimeout(() => {
      setShowPopupAd(true);
    }, 30000);

    return () => clearTimeout(timer);
  }, []);

  // Tải các script quảng cáo sau khi component đã mount
  useEffect(() => {
    // Hàm khởi tạo quảng cáo AdSense
    const initAds = () => {
      try {
        if (window.adsbygoogle) {
          window.adsbygoogle.push({});
        }
      } catch (error) {
        console.error('AdSense error:', error);
      }
    };

    // Chạy hàm khởi tạo quảng cáo
    if (typeof window !== 'undefined') {
      initAds();
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      const response = await fetch('http://103.45.234.81:5000/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify({ urls: urls.split('\n').filter((u) => u.trim()) }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Lỗi khi tải video.');
      }

      const blob = await response.blob();
      const disposition = response.headers.get('content-disposition');
      const filename = disposition?.match(/filename="?([^"]+)"?/)?.[1] || 'video_download';

      const urlObject = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = urlObject;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(urlObject);
      setSuccess(true);
      
      // Hiển thị quảng cáo popup sau khi tải xuống thành công
      setShowPopupAd(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Đóng quảng cáo popup
  const closePopupAd = () => {
    setShowPopupAd(false);
  };

  return (
    <>
      <Head>
        <title>TikTok Downloader | Tải Video Không Logo</title>
        <meta name="description" content="Công cụ tải video TikTok không có watermark dễ dàng và nhanh chóng" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      
      {/* Sử dụng Next.js Script component để tải script AdSense */}
      <Script
        id="adsbygoogle-init"
        strategy="afterInteractive"
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=pub-3484677169925235"
        crossOrigin="anonymous"
      />

      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.logoWrapper}>
            <div className={styles.logo}>
              <svg xmlns="http://www.w3.org/2000/svg" className={styles.logoIcon} viewBox="0 0 24 24">
                <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
          </div>
          <h1 className={styles.title}>TikTok Downloader</h1>
          <p className={styles.subtitle}>Tải video TikTok không logo, chất lượng cao</p>
        </header>

        {/* Banner quảng cáo trên cùng - Client-side rendered */}
        <div className={styles.adBanner}>
          <div className={styles.adLabel}>Quảng cáo</div>
          <div id="top-ad-container"></div>
        </div>

        <main className={styles.main}>
          <div className={styles.card}>
            {error && (
              <div className={styles.errorAlert}>
                <div className={styles.errorIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className={styles.successAlert}>
                <div className={styles.successIcon}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p>Tải video thành công! Video đang được tải xuống.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="urls" className={styles.label}>
                  Nhập URL TikTok
                </label>
                <textarea
                  id="urls"
                  rows={5}
                  placeholder="https://www.tiktok.com/..."
                  value={urls}
                  onChange={(e) => setUrls(e.target.value)}
                  className={styles.textarea}
                  required
                />
                <p className={styles.helperText}>Mỗi URL một dòng. Hỗ trợ cả URL web và mobile.</p>
              </div>

              <div className={styles.buttonContainer}>
                <button
                  type="submit"
                  disabled={loading}
                  className={`${styles.button} ${loading ? styles.buttonDisabled : ''}`}
                >
                  {loading ? (
                    <>
                      <span className={styles.loadingSpinner}></span>
                      <span>Đang tải...</span>
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className={styles.buttonIcon} viewBox="0 0 24 24">
                        <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      <span>Tải Video</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Quảng cáo ở giữa trang - Client-side rendered */}
          <div className={styles.middleAd}>
            <div className={styles.adLabel}>Quảng cáo</div>
            <div id="middle-ad-container"></div>
          </div>

          <div className={styles.guideCard}>
            <h2 className={styles.guideTitle}>Hướng dẫn sử dụng</h2>
            <div className={styles.steps}>
              <div className={styles.step}>
                <div className={styles.stepNumber}>1</div>
                <p className={styles.stepText}>Sao chép URL video TikTok từ ứng dụng hoặc website</p>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>2</div>
                <p className={styles.stepText}>Dán URL vào ô nhập liệu (có thể nhập nhiều URL, mỗi URL một dòng)</p>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>3</div>
                <p className={styles.stepText}>Nhấn nút "Tải Video" và đợi quá trình tải hoàn tất</p>
              </div>
            </div>
          </div>
        </main>

        {/* Quảng cáo dưới chân trang - Client-side rendered */}
        <div className={styles.bottomAd}>
          <div className={styles.adLabel}>Quảng cáo</div>
          <div id="bottom-ad-container"></div>
        </div>

        <footer className={styles.footer}>
          <p>© {currentYear} TikTok Downloader. Tất cả quyền được bảo lưu.</p>
          <p>Công cụ này không liên kết với TikTok.</p>
        </footer>
      </div>

      {/* Quảng cáo popup - Chỉ hiển thị ở client-side */}
      {showPopupAd && (
        <div className={styles.popupAdOverlay}>
          <div className={styles.popupAd}>
            <div className={styles.popupAdHeader}>
              <span className={styles.adLabel}>Quảng cáo</span>
              <button className={styles.closeButton} onClick={closePopupAd}>×</button>
            </div>
            <div className={styles.popupAdContent}>
              <div id="popup-ad-container"></div>
            </div>
          </div>
        </div>
      )}

      {/* Script để khởi tạo quảng cáo sau khi trang được tải hoàn toàn */}
      <Script id="ad-initialization" strategy="afterInteractive">
        {`
          function initializeAds() {
            const adContainers = ['top-ad-container', 'middle-ad-container', 'bottom-ad-container', 'popup-ad-container'];
            
            adContainers.forEach(containerId => {
              const container = document.getElementById(containerId);
              if (container) {
                const adElement = document.createElement('ins');
                adElement.className = 'adsbygoogle';
                adElement.style.display = 'block';
                adElement.setAttribute('data-ad-client', 'pub-3484677169925235');
                adElement.setAttribute('data-ad-slot', '9763622638');
                adElement.setAttribute('data-ad-format', 'auto');
                adElement.setAttribute('data-full-width-responsive', 'true');
                
                container.appendChild(adElement);
                
                try {
                  (window.adsbygoogle = window.adsbygoogle || []).push({});
                } catch (error) {
                  console.error('AdSense error:', error);
                }
              }
            });
          }
          
          // Đợi DOM load xong và window.adsbygoogle được định nghĩa
          window.addEventListener('load', function() {
            if (typeof window.adsbygoogle !== 'undefined') {
              setTimeout(initializeAds, 100);
            } else {
              // Nếu adsbygoogle chưa load, đợi thêm
              window.addEventListener('adsbygoogle-ready', initializeAds);
            }
          });
        `}
      </Script>
    </>
  );
}