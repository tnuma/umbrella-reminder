import React, { useState, useEffect, useCallback, useMemo} from 'react';

// 翻訳データをこのファイル内に直接定義
const translations = {
  ja: {
    appTitle: '傘リマインダー',
    hasUmbrella: '傘を持っていますか？',
    setSpot: 'ここに傘を置く',
    reminder: 'リマインダー',
    placedAt: '傘を {time} に置きました。',
    distanceAway: 'そこから約 {distance} m 離れています。',
    warning: '警告: 傘から少し離れました！',
    settings: '設定',
    pushNotifications: 'プッシュ通知',
    requestPermission: 'プッシュ通知を許可する',
    permissionGranted: '通知は許可されています',
    permissionDenied: '通知はブロックされています',
    permissionUnsupported: '通知はサポートされていません',
    currentStatus: '現在の状況',
    currentLocation: '現在地',
    locationError: '取得失敗',
    lastUpdated: '最終更新',
    weather: '天気',
    apiKeyNeeded: '【要設定】APIキーが必要です',
    locationErrorMsg: '位置情報エラー (コード: {code}) - {message}',
    browserUnsupported: 'お使いのブラウザは位置情報取得に対応していません。',
    weatherError: '天気情報の取得に失敗しました。',
    reset: 'リセット',
    theme: 'テーマ',
    language: '言語',
    light: 'ライト',
    dark: 'ダーク',
  },
  en: {
    appTitle: 'Umbrella Reminder',
    hasUmbrella: 'Have an umbrella?',
    setSpot: 'Place umbrella here',
    reminder: 'Reminder',
    placedAt: 'Placed umbrella at {time}.',
    distanceAway: 'About {distance}m away.',
    warning: 'Warning: You moved away from your umbrella!',
    settings: 'Settings',
    pushNotifications: 'Push Notifications',
    requestPermission: 'Allow Push Notifications',
    permissionGranted: 'Notifications are allowed',
    permissionDenied: 'Notifications are blocked',
    permissionUnsupported: 'Notifications not supported',
    currentStatus: 'Current Status',
    currentLocation: 'Current Location',
    locationError: 'Failed to get',
    lastUpdated: 'Last updated',
    weather: 'Weather',
    apiKeyNeeded: '[SETUP REQUIRED] API Key is needed',
    locationErrorMsg: 'Location Error (Code: {code}) - {message}',
    browserUnsupported: 'Your browser does not support Geolocation.',
    weatherError: 'Failed to fetch weather data.',
    reset: 'Reset',
    theme: 'Theme',
    language: 'Language',
    light: 'Light',
    dark: 'Dark',
  },
  zh: {
    appTitle: '雨伞提醒',
    hasUmbrella: '你带伞了吗？',
    setSpot: '把雨伞放在这里',
    reminder: '提醒',
    placedAt: '雨伞放置于 {time}。',
    distanceAway: '距离大约 {distance} 米。',
    warning: '警告：您已离开雨伞！',
    settings: '设置',
    pushNotifications: '推送通知',
    requestPermission: '允许推送通知',
    permissionGranted: '通知功能已启用',
    permissionDenied: '通知功能已被阻止',
    permissionUnsupported: '不支持通知功能',
    currentStatus: '当前状态',
    currentLocation: '当前位置',
    locationError: '获取失败',
    lastUpdated: '最后更新',
    weather: '天气',
    apiKeyNeeded: '【需要设置】请输入API密钥',
    locationErrorMsg: '位置错误 (代码: {code}) - {message}',
    browserUnsupported: '您的浏览器不支持地理位置功能。',
    weatherError: '获取天气数据失败。',
    reset: '重置',
    theme: '主题',
    language: '语言',
    light: '浅色',
    dark: '深色',
  },
};

const WEATHER_API_KEY = '0578c5598853f02cb067174a3587a030';

// --- スタイル定義 (テーマ対応) ---
const getStyles = (theme = 'dark') => {
  const isDark = theme === 'dark';
  return {
    container: { 
      backgroundColor: 'transparent', // 背景画像を見せるために透明に
      color: isDark ? '#f9fafb' : '#111827', 
      minHeight: '100vh', 
      fontFamily: 'sans-serif', 
      padding: '16px', 
      boxSizing: 'border-box', 
      display: 'flex', 
      flexDirection: 'column', 
      transition: 'color 0.5s' 
    },
    mainContent: { width: '100%', maxWidth: '448px', margin: '0 auto', zIndex: 10, display: 'flex', flexDirection: 'column', flexGrow: 1 },
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' },
    headerTitleContainer: { flex: 1, textAlign: 'center' },
    headerIconContainer: { width: '40px' },
    title: { fontSize: '24px', fontWeight: 'bold', color: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
    card: { backgroundColor: isDark ? 'rgba(31, 41, 55, 0.75)' : 'rgba(255, 255, 255, 0.65)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', padding: '24px', borderRadius: '20px', border: `1px solid ${isDark ? 'rgba(55, 65, 81, 0.5)' : 'rgba(229, 231, 235, 0.5)'}`, marginBottom: '24px', transition: 'background-color 0.3s, border-color 0.3s' },
    cardTitle: { fontSize: '20px', fontWeight: '600', color: 'inherit', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    button: { width: '100%', backgroundColor: '#4f46e5', color: 'white', fontWeight: 'bold', padding: '12px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'background-color 0.3s' },
    buttonDisabled: { backgroundColor: isDark ? '#374151' : '#e5e7eb', color: isDark ? '#9ca3af' : '#9ca3af', cursor: 'not-allowed' },
    secondaryButton: { backgroundColor: 'transparent', color: isDark ? '#9ca3af' : '#4b5563', border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`, padding: '8px 16px' },
    iconButton: { background: 'none', border: 'none', cursor: 'pointer', color: isDark ? '#9ca3af' : '#6b7280', padding: '8px' },
    toggleContainer: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' },
    toggleLabel: { fontSize: '18px', fontWeight: '500', color: isDark ? '#d1d5db' : '#374151' },
    toggleButton: { position: 'relative', display: 'inline-flex', alignItems: 'center', height: '28px', width: '52px', padding: '2px', border: '2px solid transparent', borderRadius: '9999px', cursor: 'pointer', transition: 'background-color 0.2s ease-in-out', boxSizing: 'content-box' },
    toggleSwitch: { display: 'inline-block', height: '24px', width: '24px', backgroundColor: 'white', borderRadius: '9999px', boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.1)', transition: 'transform 0.2s ease-in-out' },
    infoRow: { marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    infoSubRow: { display: 'flex', alignItems: 'center', gap: '8px' },
    infoLabel: { fontSize: '14px', fontWeight: '500', color: isDark ? '#9ca3af' : '#6b7280' },
    infoText: { color: isDark ? '#d1d5db' : '#374151' },
    infoTextMuted: { fontSize: '12px', color: isDark ? '#6b7280' : '#9ca3af' },
    distanceText: { fontWeight: 'bold', fontSize: '24px', color: '#f87171' },
    mapContainer: { marginTop: '16px', borderRadius: '8px', overflow: 'hidden', border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}` },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modalContent: { backgroundColor: isDark ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', color: 'inherit', padding: '24px', borderRadius: '12px', border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`, width: '90%', maxWidth: '400px' },
    select: { width: '100%', padding: '8px', borderRadius: '8px', border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`, backgroundColor: isDark ? '#374151' : '#f9fafb', color: 'inherit', fontSize: '16px' },
    spinner: { animation: 'rotate 1.5s linear infinite', width: '20px', height: '20px' },
    spinnerCircle: { stroke: '#60a5fa', strokeLinecap: 'round', animation: 'dash 1.5s ease-in-out infinite' },
    alertError: { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#fee2e2', borderColor: '#ef4444', color: isDark ? '#f87171' : '#b91c1c' },
    alertWarning: { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : '#fef3c7', borderColor: '#f59e0b', color: isDark ? '#fbbf24' : '#92400e' },
    warningText: { marginTop: '16px', fontWeight: 'bold', padding: '12px', borderRadius: '8px', backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2', color: isDark ? '#f87171' : '#b91c1c' },
  };
};

// --- アイコンコンポーネント ---
const SunIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: '#fbbf24'}}><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>;
const CloudIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: '#9ca3af'}}><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path></svg>;
const CloudRainIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: '#60a5fa'}}><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"></path><path d="M8 19v1"></path><path d="M8 14v1"></path><path d="M16 19v1"></path><path d="M16 14v1"></path><path d="M12 15v1"></path><path d="M12 20v1"></path></svg>;
const UmbrellaIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12a10.3 10.3 0 0 0-20 0Z"></path><path d="M12 12v8a2 2 0 0 0 4 0"></path><path d="M12 2v1"></path></svg>;
const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>;
const Spinner = () => <svg style={getStyles().spinner} viewBox="0 0 50 50"><circle style={getStyles().spinnerCircle} cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle></svg>;
const SettingsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;

// --- ★★★ 背景画像コンポーネント ★★★ ---
const WeatherBackground = ({ weather }) => {
  useEffect(() => {
    const weatherId = weather?.id;
    let imageUrl = '';
    
    // 天候に応じた画像URLを設定
    if (weatherId >= 200 && weatherId < 300) imageUrl = 'https://images.unsplash.com/photo-1561553543-e4c16356756b?q=80&w=2574&auto=format&fit=crop'; // 雷
    else if (weatherId >= 300 && weatherId < 600) imageUrl = 'https://images.unsplash.com/photo-1428592953211-077101b2021b?q=80&w=2574&auto=format&fit=crop'; // 雨
    else if (weatherId >= 600 && weatherId < 700) imageUrl = 'https://images.unsplash.com/photo-1482163972578-b44c212b1ce2?q=80&w=2574&auto=format&fit=crop'; // 雪
    else if (weatherId === 800) imageUrl = 'https://images.unsplash.com/photo-1558486012-817176f84c6d?q=80&w=2487&auto=format&fit=crop'; // 晴れ
    else if (weatherId > 800) imageUrl = 'https://images.unsplash.com/photo-1499956824413-4c478c1024f2?q=80&w=2574&auto=format&fit=crop'; // 曇り
    
    // bodyのスタイルを直接操作
    document.body.style.backgroundImage = imageUrl ? `url(${imageUrl})` : 'none';
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.transition = 'background-image 1s ease-in-out';
    
    return () => {
      // コンポーネントが消える時にスタイルをリセット
      document.body.style.backgroundImage = 'none';
    };
  }, [weather]);

  return null; // このコンポーネントは何も描画しない
};

export default function App() {
  // State
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'ja');
  const [hasUmbrella, setHasUmbrella] = useState(() => JSON.parse(localStorage.getItem('hasUmbrella') || 'false'));
  const [umbrellaSpot, setUmbrellaSpot] = useState(() => JSON.parse(localStorage.getItem('umbrellaSpot') || 'null'));
  const [notificationPermission, setNotificationPermission] = useState('Notification' in window ? Notification.permission : 'unsupported');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [distance, setDistance] = useState(null);
  const [error, setError] = useState(null);
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  const [isLocating, setIsLocating] = useState(true);
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);
  const [lastLocationUpdate, setLastLocationUpdate] = useState(null);
  const [lastWeatherFetch, setLastWeatherFetch] = useState(0);
  
  const styles = useMemo(() => getStyles(theme), [theme]);
  const t = useCallback((key, params = {}) => { let text = (translations[language] && translations[language][key]) || translations['en'][key] || key; Object.keys(params).forEach(pKey => { text = text.replace(`{${pKey}}`, params[pKey]); }); return text; }, [language]);

  useEffect(() => { localStorage.setItem('theme', theme); }, [theme]);
  useEffect(() => { localStorage.setItem('language', language); }, [language]);
  useEffect(() => { localStorage.setItem('hasUmbrella', JSON.stringify(hasUmbrella)); }, [hasUmbrella]);
  useEffect(() => { if (umbrellaSpot) { localStorage.setItem('umbrellaSpot', JSON.stringify(umbrellaSpot)); } else { localStorage.removeItem('umbrellaSpot'); } }, [umbrellaSpot]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => { return 6371e3*2*Math.atan2(Math.sqrt(Math.sin((lat2-lat1)*Math.PI/180/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin((lon2-lon1)*Math.PI/180/2)**2),Math.sqrt(1-(Math.sin((lat2-lat1)*Math.PI/180/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin((lon2-lon1)*Math.PI/180/2)**2)))};
  const handleToggleUmbrella = () => { const newHasUmbrella = !hasUmbrella; setHasUmbrella(newHasUmbrella); if (!newHasUmbrella) { setUmbrellaSpot(null); setDistance(null); } };
  const handleSetSpot = () => { if (currentLocation) { setUmbrellaSpot({ lat: currentLocation.lat, lon: currentLocation.lon, time: new Date().toLocaleTimeString(language), notificationSent: false }); setHasUmbrella(false); } };
  const handleResetSpot = () => { setUmbrellaSpot(null); setDistance(null); };
  const requestNotificationPermission = async () => { const permission = await Notification.requestPermission(); setNotificationPermission(permission); };
  
  useEffect(() => { if (WEATHER_API_KEY && WEATHER_API_KEY !== 'YOUR_API_KEY_HERE') { setIsApiKeySet(true); } }, []);
  
  useEffect(() => {
    if (!navigator.geolocation) { setError(t('browserUnsupported')); setIsLocating(false); return; }
    const successCallback = (position) => { setCurrentLocation({ lat: position.coords.latitude, lon: position.coords.longitude, }); setLastLocationUpdate(new Date()); setIsLocating(false); setError(null); };
    const errorCallback = (err) => { setError(t('locationErrorMsg', {code: err.code, message: err.message})); setIsLocating(false); };
    const watchId = navigator.geolocation.watchPosition(successCallback, errorCallback, { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 });
    return () => { navigator.geolocation.clearWatch(watchId); };
  }, [t]);

  const fetchWeather = useCallback(async (lat, lon) => { if (!isApiKeySet) return; setIsWeatherLoading(true); try { const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric&lang=${language}`); if (!response.ok) throw new Error(t('weatherError')); const data = await response.json(); setWeather({ id: data.weather[0].id, description: data.weather[0].description, icon: data.weather[0].icon, temp: data.main.temp, windSpeed: data.wind.speed }); } catch (err) { setError(err.message); } finally { setIsWeatherLoading(false); } }, [isApiKeySet, language, t]);

  useEffect(() => {
    if (currentLocation) {
      const now = new Date().getTime();
      if (now - lastWeatherFetch > 10 * 60 * 1000) { // 10分
        fetchWeather(currentLocation.lat, currentLocation.lon);
        setLastWeatherFetch(now);
      }
    }
  }, [currentLocation, fetchWeather, lastWeatherFetch]);

  useEffect(() => {
    if (umbrellaSpot && currentLocation) {
      const d = calculateDistance(umbrellaSpot.lat, umbrellaSpot.lon, currentLocation.lat, currentLocation.lon);
      setDistance(d);
      if (d > 100 && notificationPermission === 'granted' && !umbrellaSpot.notificationSent) {
        new Notification(t('appTitle'), { body: t('warning'), icon: 'icon-192x192.png' });
        setUmbrellaSpot(prevSpot => ({ ...prevSpot, notificationSent: true }));
      }
    }
  }, [currentLocation, umbrellaSpot, notificationPermission, t]);

  const getWeatherIcon = (iconCode) => { if (!iconCode) return <CloudIcon />; if (iconCode.includes('01')) return <SunIcon />; if (iconCode.includes('09') || iconCode.includes('10')) return <CloudRainIcon />; return <CloudIcon />; };
  
  return (
    <>
      <WeatherBackground weather={weather} />
      <div style={styles.container}>
        <div style={styles.mainContent}>
          <div style={{ flexShrink: 0 }}>
            <header style={styles.header}>
              <div style={styles.headerIconContainer}></div>
              <div style={styles.headerTitleContainer}><h1 style={styles.title}><UmbrellaIcon />{t('appTitle')}</h1></div>
              <div style={styles.headerIconContainer}><button onClick={() => setIsSettingsOpen(true)} style={styles.iconButton}><SettingsIcon /></button></div>
            </header>

            {error && <div style={{...styles.alertBase, ...styles.alertError}} role="alert"><p>{error}</p></div>}
            {!isApiKeySet && <div style={{...styles.alertBase, ...styles.alertWarning}} role="alert"><p style={{fontWeight: 'bold'}}>{t('apiKeyNeeded')}</p></div>}

            <div style={styles.card}>
              <div style={styles.toggleContainer}><span style={styles.toggleLabel}>{t('hasUmbrella')}</span><button onClick={handleToggleUmbrella} style={{...styles.toggleButton, backgroundColor: hasUmbrella ? '#4f46e5' : (theme === 'dark' ? '#374151' : '#e5e7eb')}}><span style={{...styles.toggleSwitch, transform: hasUmbrella ? 'translateX(24px)' : 'translateX(0)'}}/></button></div>
              <button onClick={handleSetSpot} disabled={!hasUmbrella || !currentLocation} style={{...styles.button, ...((!hasUmbrella || !currentLocation) && styles.buttonDisabled)}}><UmbrellaIcon /><span>{t('setSpot')}</span></button>
            </div>
            
            {umbrellaSpot && (
              <div style={styles.card}>
                <h2 style={styles.cardTitle}><span>{t('reminder')}</span><button onClick={handleResetSpot} style={{...styles.iconButton, color: theme === 'dark' ? '#9ca3af' : '#6b7280'}}><TrashIcon /></button></h2>
                <p style={styles.infoText}>{t('placedAt', { time: umbrellaSpot.time })}</p>
                {distance !== null && <p style={{...styles.infoText, marginTop: '8px'}}>{t('distanceAway', {distance: Math.round(distance)})}</p>}
                {distance > 1 && <p style={styles.warningText}>{t('warning')}</p>}
                <div style={styles.mapContainer}>
                  <iframe title="Umbrella Spot Map" width="100%" height="200" frameBorder="0" style={{border:0}} src={`https://maps.google.com/maps?q=${umbrellaSpot.lat},${umbrellaSpot.lon}&z=15&output=embed`} allowFullScreen></iframe>
                </div>
              </div>
            )}
          </div>
          
          <div style={{flexGrow: 1}} />

          <div style={{ flexShrink: 0 }}>
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>{t('currentStatus')}</h2>
              <div style={styles.infoRow}><p style={styles.infoLabel}>{t('currentLocation')}</p><div style={styles.infoSubRow}>{isLocating ? <Spinner /> : <p style={styles.infoText}>{currentLocation ? `${currentLocation.lat.toFixed(4)}, ${currentLocation.lon.toFixed(4)}` : t('locationError')}</p>}</div></div>
              {lastLocationUpdate && <p style={styles.infoTextMuted}>{t('lastUpdated')}: {lastLocationUpdate.toLocaleTimeString(language)}</p>}
              <div style={{...styles.infoRow, marginTop: '12px'}}><p style={styles.infoLabel}>{t('weather')}</p>{isApiKeySet && (isWeatherLoading ? <Spinner /> : (weather && <div style={styles.infoSubRow}>{getWeatherIcon(weather.icon)}<span style={styles.infoText}>{Math.round(weather.temp)}°C, {weather.description}</span></div>))}</div>
            </div>
          </div>
        </div>

        {isSettingsOpen && (
          <div style={styles.modalOverlay} onClick={() => setIsSettingsOpen(false)}>
            <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
              <h2 style={styles.cardTitle}>{t('settings')}</h2>
              <div style={{marginBottom: '20px'}}>
                <label style={{...styles.infoLabel, display: 'block', marginBottom: '8px'}}>{t('theme')}</label>
                <select value={theme} onChange={e => setTheme(e.target.value)} style={styles.select}>
                  <option value="dark">{t('dark')}</option>
                  <option value="light">{t('light')}</option>
                </select>
              </div>
              <div style={{marginBottom: '20px'}}>
                <label style={{...styles.infoLabel, display: 'block', marginBottom: '8px'}}>{t('language')}</label>
                <select value={language} onChange={e => setLanguage(e.target.value)} style={styles.select}>
                  <option value="ja">日本語</option>
                  <option value="en">English</option>
                  <option value="zh">中文</option>
                </select>
              </div>
              <div>
                 <label style={{...styles.infoLabel, display: 'block', marginBottom: '8px'}}>{t('pushNotifications')}</label>
                 <button onClick={requestNotificationPermission} disabled={notificationPermission !== 'default'} style={{...styles.button, ...styles.secondaryButton, ...((notificationPermission !== 'default') && styles.buttonDisabled), width: '100%'}}>
                   {notificationPermission === 'default' && t('requestPermission')}
                   {notificationPermission === 'granted' && t('permissionGranted')}
                   {notificationPermission === 'denied' && t('permissionDenied')}
                   {notificationPermission === 'unsupported' && t('permissionUnsupported')}
                 </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
