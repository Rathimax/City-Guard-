import { useState, useEffect } from 'react';
import ScrollExpandMedia from '@/components/ui/scroll-expansion-hero';

interface MediaAbout {
  overview: string;
  conclusion: string;
}

interface MediaContent {
  src: string;
  poster?: string;
  background: string;
  title: string;
  date: string;
  scrollToExpand: string;
  about: MediaAbout;
}

interface MediaContentCollection {
  [key: string]: MediaContent;
}

const sampleMediaContent: MediaContentCollection = {
  video: {
    src: 'https://me7aitdbxq.ufs.sh/f/2wsMIGDMQRdYuZ5R8ahEEZ4aQK56LizRdfBSqeDMsmUIrJN1',
    poster:
      'https://images.pexels.com/videos/5752729/space-earth-universe-cosmos-5752729.jpeg',
    background:
      'https://me7aitdbxq.ufs.sh/f/2wsMIGDMQRdYMNjMlBUYHaeYpxduXPVNwf8mnFA61L7rkcoS',
    title: 'CityGuard: Urban Vision',
    date: 'Smart Infrastructure',
    scrollToExpand: 'Scroll to Explore CityGuard',
    about: {
      overview:
        'Welcome to CityGuard, the next generation of urban management. This interactive hero showcase demonstrates how we visualize city-scale data and infrastructure issues.',
      conclusion:
        'By providing a clear, high-fidelity view of the city, we empower citizens and the Mayor to take action and build a better tomorrow.',
    },
  },
  image: {
    src: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=1280&auto=format&fit=crop',
    background:
      'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=1920&auto=format&fit=crop',
    title: 'Modern City Management',
    date: '2026 Initiative',
    scrollToExpand: 'Scroll to Expand',
    about: {
      overview:
        'Our city is evolving. CityGuard provides the tools to monitor and report infrastructure needs in real-time, bridging the gap between citizens and municipal services.',
      conclusion:
        'Join the thousands of citizens already making our city smarter, safer, and more efficient.',
    },
  },
};

const MediaContent = ({ mediaType }: { mediaType: 'video' | 'image' }) => {
  const currentMedia = sampleMediaContent[mediaType];

  return (
    <div className='max-w-4xl mx-auto'>
      <h2 className='text-3xl font-bold mb-6 text-black dark:text-white'>
        About CityGuard
      </h2>
      <p className='text-lg mb-8 text-black dark:text-white leading-relaxed'>
        {currentMedia.about.overview}
      </p>

      <p className='text-lg mb-8 text-black dark:text-white leading-relaxed'>
        {currentMedia.about.conclusion}
      </p>
    </div>
  );
};

const Demo = () => {
  const [mediaType, setMediaType] = useState<'video' | 'image'>('video');
  const currentMedia = sampleMediaContent[mediaType];

  useEffect(() => {
    window.scrollTo(0, 0);

    const resetEvent = new Event('resetSection');
    window.dispatchEvent(resetEvent);
  }, [mediaType]);

  return (
    <div className='min-h-screen'>
      <div className='fixed top-24 right-4 z-50 flex gap-2'>
        <button
          onClick={() => setMediaType('video')}
          className={`px-4 py-2 rounded-lg transition-all ${
            mediaType === 'video'
              ? 'bg-primary text-white scale-105 shadow-lg'
              : 'bg-black/50 text-white border border-white/30 backdrop-blur-md hover:bg-black/70'
          }`}
        >
          View Video
        </button>

        <button
          onClick={() => setMediaType('image')}
          className={`px-4 py-2 rounded-lg transition-all ${
            mediaType === 'image'
              ? 'bg-primary text-white scale-105 shadow-lg'
              : 'bg-black/50 text-white border border-white/30 backdrop-blur-md hover:bg-black/70'
          }`}
        >
          View Image
        </button>
      </div>

      <ScrollExpandMedia
        mediaType={mediaType}
        mediaSrc={currentMedia.src}
        posterSrc={mediaType === 'video' ? currentMedia.poster : undefined}
        bgImageSrc={currentMedia.background}
        title={currentMedia.title}
        date={currentMedia.date}
        scrollToExpand={currentMedia.scrollToExpand}
      >
        <MediaContent mediaType={mediaType} />
      </ScrollExpandMedia>
    </div>
  );
};

export default Demo;
