import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  FiSearch,
  FiMapPin,
  FiCalendar,
  FiTruck,
  FiGrid,
  FiList,
  FiMap,
  FiArrowRight,
  FiStar,
  FiRotateCcw,
} from 'react-icons/fi';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import expediteurService from '../../api/services/expediteurService';
import { formatNumber, formatDate } from '../../utils/format';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ProgressBar from '../../components/common/ProgressBar';
import Skeleton from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import DemoBadge from '../../components/common/DemoBadge';

// Icônes personnalisées Leaflet
const createDivIcon = (color, text) =>
  L.divIcon({
    className: 'st-map-marker',
    html: `<div style="background-color: ${color}; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 11px; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">${text}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

const iconDepart = createDivIcon('#1A3A5C', 'D');
const iconArrivee = createDivIcon('#0D9488', 'A');

const VILLES_MAROC = [
  'Casablanca',
  'Tanger',
  'Marrakech',
  'Rabat',
  'Agadir',
  'Fès',
  'Oujda',
  'Meknès',
  'Kénitra',
  'Tétouan',
];

export const TrajetsDisponibles = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Mode d'affichage : 'grid', 'list', 'map'
  const [viewMode, setViewMode] = useState('grid');

  // Filtres
  const [depart, setDepart] = useState(searchParams.get('depart') || '');
  const [arrivee, setArrivee] = useState(searchParams.get('arrivee') || '');
  const [date, setDate] = useState(searchParams.get('date') || '');
  const [poids, setPoids] = useState('');
  const [refrigereOnly, setRefrigereOnly] = useState(false);
  const [sortBy, setSortBy] = useState('date');

  // Données
  const [trajets, setTrajets] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const pageSize = 9;
  const [isLoading, setIsLoading] = useState(true);

  const fetchTrajets = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await expediteurService.rechercherTrajets({
        depart,
        arrivee,
        date,
        poids: poids ? Number(poids) : null,
        refrigere: refrigereOnly ? true : null,
        sort: sortBy,
        page,
        size: pageSize,
      });

      const list = res?.content || (Array.isArray(res) ? res : []);
      setTrajets(list);
      setTotalElements(res?.totalElements ?? list.length);
    } catch (err) {
      console.error('Erreur recherche trajets:', err);
      setTrajets([]);
    } finally {
      setIsLoading(false);
    }
  }, [depart, arrivee, date, poids, refrigereOnly, sortBy, page]);

  useEffect(() => {
    fetchTrajets();
  }, [fetchTrajets]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchTrajets();
  };

  const handleReset = () => {
    setDepart('');
    setArrivee('');
    setDate('');
    setPoids('');
    setRefrigereOnly(false);
    setSortBy('date');
    setPage(0);
    setSearchParams({});
  };

  // Coordonnées approximatives des villes pour la vue Carte
  const CITY_COORDS = {
    Casablanca: [33.5731, -7.5898],
    Tanger: [35.7595, -5.834],
    Marrakech: [31.6295, -7.9811],
    Rabat: [34.0209, -6.8416],
    Agadir: [30.4278, -9.5981],
    Fès: [34.0331, -5.0003],
    Oujda: [34.6805, -1.9076],
    Meknès: [33.8938, -5.5516],
    Kénitra: [34.261, -6.58],
    Tétouan: [35.5889, -5.3626],
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 1. HEADER DE PAGE */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1A3A5C', margin: 0 }}>
              Trajets disponibles ({totalElements})
            </h1>
            <DemoBadge />
          </div>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#718096' }}>
            Consultez les départs prévus, comparez les tarifs au kilo et réservez instantanément votre place en camion.
          </p>
        </div>

        {/* COMMUTATEUR DE VUES */}
        <div style={{ display: 'flex', backgroundColor: '#EDF2F7', borderRadius: 8, padding: 4, gap: 4 }}>
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              border: 'none',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: viewMode === 'grid' ? '#FFFFFF' : 'transparent',
              color: viewMode === 'grid' ? '#1A3A5C' : '#718096',
              boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            <FiGrid size={15} />
            Grille
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              border: 'none',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: viewMode === 'list' ? '#FFFFFF' : 'transparent',
              color: viewMode === 'list' ? '#1A3A5C' : '#718096',
              boxShadow: viewMode === 'list' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            <FiList size={15} />
            Liste
          </button>
          <button
            type="button"
            onClick={() => setViewMode('map')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              border: 'none',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              backgroundColor: viewMode === 'map' ? '#FFFFFF' : 'transparent',
              color: viewMode === 'map' ? '#1A3A5C' : '#718096',
              boxShadow: viewMode === 'map' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            <FiMap size={15} />
            Carte
          </button>
        </div>
      </div>

      {/* 2. BARRE DE RECHERCHE & FILTRES RAPIDES */}
      <form
        onSubmit={handleSearchSubmit}
        style={{
          backgroundColor: '#FFFFFF',
          padding: 16,
          borderRadius: 8,
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {/* VILLE DÉPART */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#718096', textTransform: 'uppercase' }}>
              Départ
            </label>
            <select
              className="st-input"
              value={depart}
              onChange={(e) => setDepart(e.target.value)}
              style={{ marginTop: 4 }}
            >
              <option value="">Toutes les villes</option>
              {VILLES_MAROC.map((v) => (
                <option key={`dep-${v}`} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          {/* VILLE ARRIVÉE */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#718096', textTransform: 'uppercase' }}>
              Destination
            </label>
            <select
              className="st-input"
              value={arrivee}
              onChange={(e) => setArrivee(e.target.value)}
              style={{ marginTop: 4 }}
            >
              <option value="">Toutes les villes</option>
              {VILLES_MAROC.map((v) => (
                <option key={`arr-${v}`} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          {/* DATE DÉPART */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#718096', textTransform: 'uppercase' }}>
              Date de départ
            </label>
            <input
              type="date"
              className="st-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{ marginTop: 4 }}
            />
          </div>

          {/* POIDS MINIMUM */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#718096', textTransform: 'uppercase' }}>
              Poids nécessaire (kg)
            </label>
            <input
              type="number"
              placeholder="Ex : 1500"
              className="st-input"
              value={poids}
              onChange={(e) => setPoids(e.target.value)}
              style={{ marginTop: 4 }}
            />
          </div>

          {/* TRI */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#718096', textTransform: 'uppercase' }}>
              Trier par
            </label>
            <select
              className="st-input"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ marginTop: 4 }}
            >
              <option value="date">Date de départ (Plus proche)</option>
              <option value="prix">Prix au kilo (Croissant)</option>
              <option value="remplissage">Taux de remplissage</option>
            </select>
          </div>
        </div>

        {/* FILTRES CHIPS & BOUTONS D'ACTION */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, paddingTop: 6, borderTop: '1px solid #EDF2F7' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#4A5568', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={refrigereOnly}
                onChange={(e) => setRefrigereOnly(e.target.checked)}
              />
              ❄️ Camion frigorifique uniquement
            </label>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="ghost" size="sm" icon={<FiRotateCcw />} onClick={handleReset}>
              Réinitialiser
            </Button>
            <Button variant="primary" size="sm" icon={<FiSearch />} type="submit">
              Appliquer les filtres
            </Button>
          </div>
        </div>
      </form>

      {/* 3. CONTENU PRINCIPAL SELON LE MODE DE VUE */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} variant="card" height={220} />
          ))}
        </div>
      ) : trajets.length === 0 ? (
        <EmptyState
          icon={<FiTruck size={36} color="#718096" />}
          title="Aucun trajet correspondant à vos critères"
          description="Essayez d'élargir votre recherche géographique ou modifiez les dates de départ sélectionnées."
          action={
            <Button variant="outline" size="sm" onClick={handleReset}>
              Effacer les filtres
            </Button>
          }
        />
      ) : (
        <>
          {/* VUE 1 : GRILLE DE CARTES */}
          {viewMode === 'grid' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16 }}>
              {trajets.map((t) => {
                const tarif = t.prixParKg ?? t.prixKg ?? t.prix;
                return (
                  <div
                    key={t.id || t.reference}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: 8,
                      border: '1px solid #E2E8F0',
                      padding: 16,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 14,
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    }}
                  >
                    {/* EN-TÊTE CARTE */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#1A3A5C' }}>
                        {t.reference || `#TR-${t.id}`}
                      </span>
                      <Badge status={t.statutTrajet || 'PUBLIE'} />
                    </div>

                    {/* ITINÉRAIRE */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15 }}>
                        <FiMapPin size={16} color="#1A3A5C" />
                        <strong>{t.villeDepart}</strong>
                        <span style={{ color: '#CBD5E0' }}>→</span>
                        <FiMapPin size={16} color="#F57C00" />
                        <strong>{t.villeArrivee}</strong>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#718096', marginTop: 4 }}>
                        <FiCalendar size={13} />
                        <span>Départ : {formatDate(t.dateDepart)}</span>
                      </div>
                    </div>

                    {/* TRANSPORTEUR & NOTE */}
                    <div
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#F8FAFC',
                        borderRadius: 6,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: 12,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <FiTruck color="#718096" />
                        <strong>{t.transporteurNom || 'Transporteur Partenaire'}</strong>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#D97706', fontWeight: 600 }}>
                        <FiStar size={12} fill="#D97706" />
                        <span>{t.transporteurNote || 4.8}</span>
                      </div>
                    </div>

                    {/* CAPACITÉ & CHARGEMENT */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#718096', marginBottom: 4 }}>
                        <span>Espace restant disponible</span>
                        <strong style={{ color: '#2E7D32' }}>{formatNumber(t.poidsDisponible || 0)} kg</strong>
                      </div>
                      <ProgressBar
                        value={t.tauxRemplissage || 40}
                        color={t.tauxRemplissage > 80 ? '#2E7D32' : '#F57C00'}
                        height={6}
                      />
                    </div>

                    {/* TARIFICATION & ACTION */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingTop: 10,
                        borderTop: '1px solid #EDF2F7',
                      }}
                    >
                      <div>
                        <span style={{ fontSize: 11, color: '#718096' }}>Tarif estimé</span>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#1A3A5C' }}>
                          {tarif ? `${tarif} DH / kg` : 'Négociable'}
                        </div>
                      </div>

                      <Link to={`/expediteur/trajets/${t.trajetId || t.id}`} style={{ textDecoration: 'none' }}>
                        <Button variant="secondary" size="sm" icon={<FiArrowRight />}>
                          Réserver
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* VUE 2 : TABLEAU LISTE */}
          {viewMode === 'list' && (
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 8,
                border: '1px solid #E2E8F0',
                overflow: 'hidden',
              }}
            >
              <table className="st-table" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Réf.</th>
                    <th>Itinéraire</th>
                    <th>Date départ</th>
                    <th>Transporteur</th>
                    <th>Espace libre</th>
                    <th>Tarif / kg</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {trajets.map((t) => (
                    <tr key={t.id || t.reference}>
                      <td>
                        <strong>{t.reference || `#TR-${t.id}`}</strong>
                      </td>
                      <td>
                        <strong>{t.villeDepart} → {t.villeArrivee}</strong>
                        {t.typeCamion && (
                          <div style={{ fontSize: 11, color: '#718096' }}>{t.typeCamion}</div>
                        )}
                      </td>
                      <td>{formatDate(t.dateDepart)}</td>
                      <td>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          {t.transporteurNom || 'Partenaire'}
                          <FiStar size={11} fill="#D97706" color="#D97706" />
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: '#2E7D32' }}>{formatNumber(t.poidsDisponible)} kg</strong>
                      </td>
                      <td>
                        <strong>{t.prixParKg ?? t.prixKg ?? t.prix ? `${t.prixParKg ?? t.prixKg ?? t.prix} DH` : 'Sur devis'}</strong>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Link to={`/expediteur/trajets/${t.trajetId || t.id}`} style={{ textDecoration: 'none' }}>
                          <Button variant="secondary" size="sm">
                            Réserver
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* VUE 3 : CARTE INTERACTIVE LEAFLET */}
          {viewMode === 'map' && (
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 8,
                border: '1px solid #E2E8F0',
                padding: 12,
                height: 520,
              }}
            >
              <MapContainer
                center={[32.5, -6.5]}
                zoom={6}
                style={{ height: '100%', width: '100%', borderRadius: 6 }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; OpenStreetMap contributors'
                />
                {trajets.map((t) => {
                  const depCoords = CITY_COORDS[t.villeDepart] || [33.5731, -7.5898];
                  const arrCoords = CITY_COORDS[t.villeArrivee] || [35.7595, -5.834];

                  return (
                    <React.Fragment key={`map-tr-${t.id || t.trajetId}`}>
                      <Marker position={depCoords} icon={iconDepart}>
                        <Popup>
                          <strong>Départ : {t.villeDepart}</strong>
                          <br />
                          Trajet vers {t.villeArrivee}
                        </Popup>
                      </Marker>

                      <Marker position={arrCoords} icon={iconArrivee}>
                        <Popup>
                          <strong>Arrivée : {t.villeArrivee}</strong>
                          <br />
                          {t.transporteurNom}
                          <br />
                          <Link to={`/expediteur/trajets/${t.trajetId || t.id}`} style={{ color: '#0D9488', fontWeight: 600 }}>
                            Réserver ce trajet →
                          </Link>
                        </Popup>
                      </Marker>

                      <Polyline
                        positions={[depCoords, arrCoords]}
                        color="#0D9488"
                        weight={3}
                        dashArray="6, 8"
                        opacity={0.8}
                      />
                    </React.Fragment>
                  );
                })}
              </MapContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TrajetsDisponibles;