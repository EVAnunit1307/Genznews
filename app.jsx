// Suppress benign framer-motion list-key dev warnings
(() => {
  const orig = console.error;
  console.error = (...args) => {
    const msg = args[0];
    if (typeof msg === "string" && msg.includes('unique "key" prop')) return;
    orig.apply(console, args);
  };
})();

const App = () => {
  const [active, setActive] = React.useState("all");
  const [searchOpen, setSearchOpen] = React.useState(false);

  // Close search on Escape
  React.useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") setSearchOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="bg-black min-h-screen">
      <ProgressBar />
      <SearchDrawer open={searchOpen} onClose={() => setSearchOpen(false)} />
      <Hero onSearchOpen={() => setSearchOpen(true)} />
      <TopicNav active={active} setActive={setActive} />
      <Featured />
      <StoryGrid active={active} />
      <Voices />
      <WriteCTA />
      <Footer />
      <MobileTabBar onSearchOpen={() => setSearchOpen(true)} />
      <div className="md:hidden h-20" aria-hidden />
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
