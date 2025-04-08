import {useState, useEffect} from 'react';
import {ThemeToggle} from '@/components/ThemeToggle';
import {Button} from '@/components/ui/button';
import {Menu, X} from 'lucide-react';
import {Link} from 'react-router-dom';

// Define the types for NavItem props
interface NavItemProps {
  to: string;
  label: string;
  onClick?: () => void;
}

// NavItem component for consistent navigation links
const NavItem = ({to, label, onClick}: NavItemProps) => (
  <Link
    to={to}
    className="px-3 py-2 rounded-md text-sm font-medium hover:text-primary transition-colors"
    onClick={onClick}
  >
    {label}
  </Link>
);

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled
        ? 'bg-background/80 backdrop-blur-md shadow-sm'
        : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="/" className="flex items-center">
              <span className="text-2xl font-bold gradient-text">Speekly</span>
            </a>
          </div>

          {/* Navigation - Desktop */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              <a href="#features"
                 className="px-3 py-2 rounded-md text-sm font-medium hover:text-primary transition-colors">
                Features
              </a>
              <a href="#demo"
                 className="px-3 py-2 rounded-md text-sm font-medium hover:text-primary transition-colors">
                Demo
              </a>
              <a href="#download"
                 className="px-3 py-2 rounded-md text-sm font-medium hover:text-primary transition-colors">
                Download
              </a>

              {/* New NavItems */}
              <NavItem to="/settings" label="Settings"/>
              <NavItem to="/models" label="Models"/>
              <NavItem to="/transcription" label="Transcription"/>
              <NavItem to="/live" label="Live"/>

              <Link to="/webspeech" className="px-3 py-2 rounded-md text-sm font-medium hover:text-primary transition-colors">
                Web Speech
              </Link>

              <ThemeToggle/>
              <Button className="speekly-gradient">
                Get Started
              </Button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <ThemeToggle/>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="ml-2"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6"/>
              ) : (
                <Menu className="h-6 w-6"/>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-md">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <a
              href="#features"
              className="block px-3 py-2 rounded-md text-base font-medium hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="#demo"
              className="block px-3 py-2 rounded-md text-base font-medium hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Demo
            </a>
            <a
              href="#download"
              className="block px-3 py-2 rounded-md text-base font-medium hover:text-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Download
            </a>

            {/* New NavItems for mobile */}
            <NavItem
              to="/settings"
              label="Settings"
              onClick={() => setMobileMenuOpen(false)}
            />
            <NavItem
              to="/models"
              label="Models"
              onClick={() => setMobileMenuOpen(false)}
            />
            <NavItem
              to="/transcription"
              label="Transcription"
              onClick={() => setMobileMenuOpen(false)}
            />
            <NavItem
              to="/webspeech"
              label="Web Speech"
              onClick={() => setMobileMenuOpen(false)}
            />
            <NavItem
              to="/live"
              label="Live"
              onClick={() => setMobileMenuOpen(false)}
            />

            <div className="pt-2">
              <Button className="w-full speekly-gradient">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
