// Suppress benign framer-motion list-key dev warnings
(() => {
  const orig = console.error;
  console.error = (...args) => {
    const msg = args[0];
    if (typeof msg === "string" && msg.includes('unique "key" prop')) return;
    orig.apply(console, args);
  };
})();

// Root app
const App = () => {
  const [active, setActive] = React.useState("all");
  return (
    <div className="bg-black min-h-screen">
      <ProgressBar />
      <Hero />
      <TopicNav active={active} setActive={setActive} />
      <Featured />
      <StoryGrid active={active} />
      <Voices />
      <WriteCTA />
      <Footer />
      <MobileTabBar />
      <div className="md:hidden h-20" aria-hidden />
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
