function Navbar() {
  return (
    <nav>
      <div className="logo">AGE AI</div>

      <div className="nav-links">
        <a href="/">Home</a>
        <a href="/predict">Predict Age</a>
        <a href="/how-it-works">How It Works</a>
        <a href="/about">About</a>
      </div>

      <button>Get Started</button>
    </nav>
  );
}

export default Navbar;