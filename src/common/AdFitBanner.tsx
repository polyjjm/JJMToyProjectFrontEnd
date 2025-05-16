// components/AdFitBanner.tsx
import { useEffect, useRef } from 'react';

interface AdFitBannerProps {
  adUnit: string;
  width: number;
  height: number;
}

const AdFitBanner: React.FC<AdFitBannerProps> = ({ adUnit, width, height }) => {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!adRef.current) return;

    const ins = document.createElement('ins');
    ins.className = 'kakao_ad_area';
    ins.style.display = 'none';
    ins.setAttribute('data-ad-unit', adUnit);
    ins.setAttribute('data-ad-width', width.toString());
    ins.setAttribute('data-ad-height', height.toString());

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://t1.daumcdn.net/kas/static/ba.min.js';

    adRef.current.innerHTML = '';
    adRef.current.appendChild(ins);
    adRef.current.appendChild(script);
  }, [adUnit, width, height]);

  return <div ref={adRef} />;
};

export default AdFitBanner;