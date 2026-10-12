import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  FiArrowLeft,
  FiRefreshCw,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import transporteurService from '../../api/services/transporteurService';
import { formatNumber, formatPercent } from '../../utils/format';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import ProgressBar from '../../components/common/ProgressBar';
import DemoBadge from '../../components/common/DemoBadge';

// Icônes personnalisées SVG Leaflet stylées pour SoukTransport
const createIcon = (bg, color, text = '') =>
  L.divIcon({
    className: 'st-map-pin',
    html: `
      <div style="
        background-color: ${bg};
        color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 3px 6px rgba(0,0,0,0.3);
        border: 2px solid white;
        font-weight: bold;
        font-size: 13px;
      ">
        ${text || '•'}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

const iconDepart = createIcon('#1A3A5C', '#FFFFFF', 'D');
const iconArrivee = createIcon('#2E7D32', '#FFFFFF', 'A');
const iconCamion = createIcon('#F57C00', '#FFFFFF', '🚛');

export const SuiviGpsPage = () => {
  const { id } = useParams();
  const trajetId = id || 101;
  const [suiviData, setSuiviData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);

  // Coordonnées de route (Casablanca -> Tanger)
  const routeCoordinates = [
    [33.5731, -7.5898], // Casablanca
    [33.7022, -7.3489], // Mohammédia
    [34.0209, -6.8416], // Rabat
    [34.2610, -6.5800], // Kénitra
    [34.8000, -6.1500], // Larache
    [35.1700, -6.0000], // Asilah
    [35.7595, -5.8340], // Tanger
  ];

  const fetchSuivi = async () => {
    try {
      const data = await transporteurService.getSuiviTrajet(trajetId);
      setSuiviData(data);
    } catch {
      // Fallback coordonnées Maroc
      setSuiviData({
        trajetId,
        departNom: 'Casablanca (Port)',
        arriveeNom: 'Tanger Med',
        latitudeActuelle: 34.261,
        longitudeActuelle: -6.58,
        vitesseKmH: 78,
        distanceRestanteKm: 142,
        tempsRestantMinutes: 105,
        progressionPct: 58,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuivi();
  }, [trajetId]);

  // Simulation d'avancée de la position GPS
  const handleAvancerGps = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setSuiviData((prev) => {
        const nextPct = Math.min(100, (prev?.progressionPct || 50) + 8);
        const nextDist = Math.max(0, (prev?.distanceRestanteKm || 140) - 18);
        return {
          ...prev,
          progressionPct: nextPct,
          distanceRestanteKm: nextDist,
          latitudeActuelle: (prev?.latitudeActuelle || 34.261) + 0.08,
          longitudeActuelle: (prev?.longitudeActuelle || -6.58) + 0.05,
          vitesseKmH: 82,
        };
      });
      setIsSimulating(false);
      toast.success('Position GPS actualisée (+18 km enregistrés).');
    }, 400);
  };

  const currentLat = suiviData?.latitudeActuelle || 34.261;
  const currentLng = suiviData?.longitudeActuelle || -6.58;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1A3A5C', margin: 0 }}>
              Suivi GPS du Trajet #{trajetId}
            </h1>
            <DemoBadge />
          </div>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#718096' }}>
            Localisation satellite et télémétrie en temps réel sur le réseau autoroutier marocain.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/transporteur/trajets" style={{ textDecoration: 'none' }}>
            <Button variant="outline" size="sm" icon={<FiArrowLeft />}>
              Retour aux trajets
            </Button>
          </Link>

          <Button
            variant="secondary"
            size="sm"
            icon={<FiRefreshCw />}
            onClick={handleAvancerGps}
            isLoading={isSimulating}
          >
            Actualiser position GPS
          </Button>
        </div>
      </div>

      {/* BANDEAU DE STATISTIQUES TÉLÉMÉTRIE */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
        <div style={{ backgroundColor: '#FFFFFF', padding: 14, borderRadius: 8, border: '1px solid #E2E8F0' }}>
          <span style={{ fontSize: 11, color: '#718096', textTransform: 'uppercase' }}>Vitesse actuelle</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#1A3A5C', marginTop: 2 }}>
            {suiviData?.vitesseKmH || 78} km/h
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', padding: 14, borderRadius: 8, border: '1px solid #E2E8F0' }}>
          <span style={{ fontSize: 11, color: '#718096', textTransform: 'uppercase' }}>Distance restante</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#1A3A5C', marginTop: 2 }}>
            {formatNumber(suiviData?.distanceRestanteKm || 142)} km
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', padding: 14, borderRadius: 8, border: '1px solid #E2E8F0' }}>
          <span style={{ fontSize: 11, color: '#718096', textTransform: 'uppercase' }}>Temps d'arrivée estimé</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#1A3A5C', marginTop: 2 }}>
            ~ {Math.floor((suiviData?.tempsRestantMinutes || 105) / 60)}h {(suiviData?.tempsRestantMinutes || 105) % 60}min
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', padding: 14, borderRadius: 8, border: '1px solid #E2E8F0' }}>
          <span style={{ fontSize: 11, color: '#718096', textTransform: 'uppercase' }}>Progression du parcours</span>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#2E7D32', marginTop: 2 }}>
            {formatPercent(suiviData?.progressionPct || 58)}
          </div>
        </div>
      </div>

      {/* JAUGE DE PROGRESSION DE LA ROUTE */}
      <div style={{ backgroundColor: '#FFFFFF', padding: 16, borderRadius: 8, border: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
          <strong>{suiviData?.departNom || 'Casablanca'}</strong>
          <span style={{ color: '#F57C00', fontWeight: 600 }}>En transit sur l'A1</span>
          <strong>{suiviData?.arriveeNom || 'Tanger'}</strong>
        </div>
        <ProgressBar
          value={suiviData?.progressionPct || 58}
          color="#F57C00"
          height={8}
        />
      </div>

      {/* CARTE INTERACTIVE LEAFLET */}
      <Card style={{ padding: 0, overflow: 'hidden', height: 480 }}>
        {!isLoading && (
          <MapContainer
            center={[currentLat, currentLng]}
            zoom={8}
            scrollWheelZoom={false}
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* TRACÉ DE L'AUTOROUTE (POLYLINE) */}
            <Polyline
              positions={routeCoordinates}
              color="#1A3A5C"
              weight={5}
              opacity={0.8}
            />

            {/* MARQUEUR DÉPART */}
            <Marker position={routeCoordinates[0]} icon={iconDepart}>
              <Popup>
                <strong>Départ : {suiviData?.departNom || 'Casablanca'}</strong>
              </Popup>
            </Marker>

            {/* MARQUEUR ARRIVÉE */}
            <Marker position={routeCoordinates[routeCoordinates.length - 1]} icon={iconArrivee}>
              <Popup>
                <strong>Arrivée : {suiviData?.arriveeNom || 'Tanger'}</strong>
              </Popup>
            </Marker>

            {/* MARQUEUR CAMION ACTUEL */}
            <Marker position={[currentLat, currentLng]} icon={iconCamion}>
              <Popup>
                <div>
                  <strong>Camion en circulation</strong>
                  <div>Vitesse : {suiviData?.vitesseKmH || 78} km/h</div>
                  <div>Distance restante : {suiviData?.distanceRestanteKm || 142} km</div>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        )}
      </Card>
    </div>
  );
};

export default SuiviGpsPage;
