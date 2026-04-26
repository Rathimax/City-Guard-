import { useEffect } from 'react';
import ScrollExpandMedia from './ui/scroll-expansion-hero';

interface MediaDetails {
  src: string;
  background: string;
  title: string;
  date: string;
  scrollToExpand: string;
  about: {
    overview: string;
    conclusion: string;
  };
}

const photoContent: MediaDetails = {
  src: 'https://plus.unsplash.com/premium_photo-1661878091370-4ccb8763756a?q=80&w=2064&auto=format&fit=crop',
  background: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?q=80&w=1740&auto=format&fit=crop',
  title: 'CityGuard: Resolving problems',
  date: 'mission to clean the city',
  scrollToExpand: 'scroll to expand',
  about: {
    overview: 'Our city is evolving. CityGuard provides the tools to monitor and report infrastructure needs in real-time, bridging the gap between citizens and municipal services.',
    conclusion: 'Join the thousands of citizens already making our city smarter, safer, and more efficient.'
  }
};

const Hero = () => {
  useEffect(() => {
    // Ensure we start at the top
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className='w-full'>
      <ScrollExpandMedia
        mediaType='image'
        mediaSrc={photoContent.src}
        bgImageSrc={photoContent.background}
        title={photoContent.title}
        date={photoContent.date}
        scrollToExpand={photoContent.scrollToExpand}
        textBlend
        centerText="Your city is your responsibility"
      >
        <div className='max-w-4xl mx-auto'>
          <h2 className='text-3xl font-bold mb-6 text-foreground'>
            About CityGuard
          </h2>
          <p className='text-lg mb-8 text-muted-foreground leading-relaxed'>
            {photoContent.about.overview}
          </p>
          <p className='text-lg mb-8 text-muted-foreground leading-relaxed'>
            {photoContent.about.conclusion}
          </p>
        </div>
      </ScrollExpandMedia>
    </div>
  );
};

export default Hero;
