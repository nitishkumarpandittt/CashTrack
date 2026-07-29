import Header from "./_components/Header";
import Hero from "./_components/Hero";
import MotionProvider from "./_components/motion/MotionProvider";
import Preloader from "./_components/motion/Preloader";
import NoiseOverlay from "./_components/motion/NoiseOverlay";
import ScrollProgress from "./_components/motion/ScrollProgress";
import CursorLabel from "./_components/motion/CursorLabel";

export default function Home() {
  return (
    <MotionProvider>
      {/* cash-no-select: the marketing copy is not meant to be highlighted or
          dragged. The wrapper is a plain block box, so it adds no layout of its
          own and every ScrollTrigger measurement below is unchanged. */}
      <div className="cash-no-select">
        {/* Layer stack, highest first: preloader 1000, noise 999, scroll bar 995,
            cursor 200, header 50. */}
        <Preloader />
        <NoiseOverlay />
        <ScrollProgress />
        <CursorLabel />
        <Header />
        <Hero />
      </div>
    </MotionProvider>
  );
}
