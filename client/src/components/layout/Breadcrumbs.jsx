import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <nav className="flex items-center gap-2 text-xs text-slate-500 mb-4">
      <Link to="/dashboard" className="hover:text-slate-800 font-medium">
        Home
      </Link>
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        return (
          <React.Fragment key={to}>
            <ChevronRight size={12} />
            {isLast ? (
              <span className="text-slate-800 font-semibold capitalize">{value}</span>
            ) : (
              <Link to={to} className="hover:text-slate-800 font-medium capitalize">
                {value}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}