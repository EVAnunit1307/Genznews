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
  const [authOpen, setAuthOpen] = React.useState(false);
  const [user, setUser] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem("genzthinks_user")); } catch { return null; }
  });

  React.useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") { setSearchOpen(false); setAuthOpen(false); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("genzthinks_token");
    localStorage.removeItem("genzthinks_user");
    setUser(null);
  };

  return (
    <div className="bg-black min-h-screen">
      <ProgressBar />
      <AnimatePresence>
        {searchOpen && <SearchDrawer key="search" open={searchOpen} onClose={() => setSearchOpen(false)} />}
        {authOpen && <AuthModal key="auth" open={authOpen} onClose={() => setAuthOpen(false)} onSuccess={setUser} />}
      </AnimatePresence>
      <Hero
        onSearchOpen={() => setSearchOpen(true)}
        user={user}
        onAuthOpen={() => setAuthOpen(true)}
        onLogout={handleLogout}
      />
      <TopicNav active={active} setActive={setActive} />
      <Featured />
      <StoryGrid active={active} />
      <Voices />
      <MissionSection />
      <WriteCTA />
      <Footer />
      <MobileTabBar onSearchOpen={() => setSearchOpen(true)} />
      <div className="md:hidden h-20" aria-hidden />
    </div>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
