import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ThemeProvider } from '@mui/material/styles';
import muiTheme from '../../../styles/themeMui';
import AppSidebar from './AppSidebar';
import AppHeader from './AppHeader';
import GlobalSearchModal from './GlobalSearchModal';
import ShortcutsHelpModal from './ShortcutsHelpModal';
import { useAuth } from '../../../context/AuthContext';
import '../../../styles/app-shell.css';

export const AppLayout = ({ children }) => {
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const role = user?.role || 'TRANSPORTEUR';
  const isRtl = i18n.language === 'ar';

  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('st_sidebar_collapsed') === 'true';
  });
  const [searchOpen, setSearchOpen] = useState(false);
  const [shortcutsHelpOpen, setShortcutsHelpOpen] = useState(false);

  // Détection des séquences de touches (ex: 'g' puis 'd')
  const lastKeyRef = useRef({ key: '', time: 0 });

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('st_sidebar_collapsed', String(next));
      return next;
    });
  };

  // Gestion des raccourcis clavier globaux
  useEffect(() => {
    const handleKeyDown = (e) => {
      const targetTag = e.target.tagName?.toLowerCase();
      const isInput = targetTag === 'input' || targetTag === 'textarea' || targetTag === 'select' || e.target.isContentEditable;

      // 1. Ctrl+K ou Cmd+K : Palette de recherche
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
        return;
      }

      // 2. Échap (Esc) : Fermer les fenêtres d'aide ou de recherche
      if (e.key === 'Escape') {
        if (searchOpen) setSearchOpen(false);
        if (shortcutsHelpOpen) setShortcutsHelpOpen(false);
        return;
      }

      // Si l'utilisateur est en train de taper dans un champ, ne pas intercepter les touches simples
      if (isInput) return;

      // 3. '?' (Shift + /) : Aide des raccourcis
      if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
        e.preventDefault();
        setShortcutsHelpOpen((prev) => !prev);
        return;
      }

      // 4. Séquences 'g' (Go to)
      const now = Date.now();
      const lastKey = lastKeyRef.current;

      if (e.key.toLowerCase() === 'g') {
        lastKeyRef.current = { key: 'g', time: now };
        return;
      }

      if (lastKey.key === 'g' && now - lastKey.time < 1200) {
        lastKeyRef.current = { key: '', time: 0 };
        const k = e.key.toLowerCase();

        if (k === 'd') {
          e.preventDefault();
          if (role === 'ADMIN') navigate('/admin/dashboard');
          else if (role === 'EXPEDITEUR') navigate('/expediteur/dashboard');
          else navigate('/transporteur/dashboard');
        } else if (k === 't') {
          e.preventDefault();
          if (role === 'ADMIN') navigate('/admin/trajets');
          else if (role === 'EXPEDITEUR') navigate('/expediteur/trajets');
          else navigate('/transporteur/trajets');
        } else if (k === 'c') {
          e.preventDefault();
          if (role === 'ADMIN') navigate('/admin/cargaisons');
          else if (role === 'EXPEDITEUR') navigate('/expediteur/cargaisons');
          else navigate('/transporteur/camions');
        } else if (k === 'r') {
          e.preventDefault();
          if (role === 'ADMIN') navigate('/admin/paiements');
          else if (role === 'EXPEDITEUR') navigate('/expediteur/paiements');
          else navigate('/transporteur/revenus');
        } else if (k === 'u' && role === 'ADMIN') {
          e.preventDefault();
          navigate('/admin/users');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen, shortcutsHelpOpen, role, navigate]);

  return (
    <div className={`app-shell ${isRtl ? 'rtl-mode' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <ThemeProvider theme={muiTheme}>
        <div className="app-shell-layout">
          {/* SIDEBAR FIXE */}
          <AppSidebar
            isCollapsed={isCollapsed}
            onToggleCollapse={toggleCollapse}
          />

          {/* CONTENU PRINCIPAL */}
          <div className={`st-main-wrapper ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
            {/* HEADER 64PX */}
            <AppHeader
              onToggleSidebar={toggleCollapse}
              onOpenSearch={() => setSearchOpen(true)}
              onOpenShortcuts={() => setShortcutsHelpOpen(true)}
            />

            {/* VUE DE LA PAGE (MAX 1440PX) */}
            <main className="st-page-content">
              {children || <Outlet />}
            </main>
          </div>

          {/* PALETTE DE RECHERCHE RAPIDE CTRL+K */}
          <GlobalSearchModal
            isOpen={searchOpen}
            onClose={() => setSearchOpen(false)}
          />

          {/* AIDE DES RACCOURCIS CLAVIER '?' */}
          <ShortcutsHelpModal
            isOpen={shortcutsHelpOpen}
            onClose={() => setShortcutsHelpOpen(false)}
          />
        </div>
      </ThemeProvider>
    </div>
  );
};

export default AppLayout;
