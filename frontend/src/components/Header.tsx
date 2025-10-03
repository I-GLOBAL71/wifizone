import Logo from "./Logo";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center items-center py-4 bg-background">
      <Logo size="sm" />
    </header>
  );
};

export default Header;