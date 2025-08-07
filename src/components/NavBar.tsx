import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

interface NavLink {
  href: string;
  label: string;
}

interface NavBarProps {
  links: NavLink[];
}

const NavBar: React.FC<NavBarProps> = ({ links }) => {
  const router = useRouter();
  return (
    <nav className="bg-white shadow p-4 flex space-x-4">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`text-gray-700 hover:text-gray-900 ${
            router.pathname === link.href ? 'font-bold underline' : ''
          }`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
};

export default NavBar;
