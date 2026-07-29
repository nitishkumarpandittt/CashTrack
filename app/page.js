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
      {/* Layer stack, highest first: preloader 1000, noise 999, scroll bar 995,
          cursor 200, header 50. */}
      <Preloader />
      <NoiseOverlay />
      <ScrollProgress />
      <CursorLabel />
      <Header />
      <Hero />
    </MotionProvider>
  );
}
