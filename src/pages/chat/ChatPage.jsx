import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  FiSend,
  FiSearch,
  FiMessageSquare,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiTruck,
  FiFileText,
  FiPackage,
  FiRefreshCw,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import chatService from '../../api/services/chatService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ContratModal from '../../components/contrat/ContratModal';

export const ChatPage = () => {
  const [searchParams] = useSearchParams();
  const offreParam = searchParams.get('offreId');

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const data = await chatService.getMesConversations();
      setConversations(data);

      if (offreParam) {
        // Si ouvert avec un paramètre offreId, initier ou basculer vers cette conversation
        const found = data.find((c) => c.offreId === Number(offreParam));
        if (found) {
          setActiveConv(found);
        } else {
          const created = await chatService.ouvrirConversationParOffre(offreParam);
          setConversations((prev) => [created, ...prev]);
          setActiveConv(created);
        }
      } else if (data.length > 0 && !activeConv) {
        setActiveConv(data[0]);
      }
    } catch {
      toast.error('Erreur lors du chargement des conversations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [offreParam]);

  useEffect(() => {
    if (!activeConv) return;
    const loadMessages = async () => {
      try {
        const res = await chatService.getMessages(activeConv.id);
        setMessages(res.content || []);
        await chatService.marquerCommeLu(activeConv.id);
      } catch {
        toast.error('Erreur lors du chargement des messages.');
      }
    };
    loadMessages();
  }, [activeConv]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConv) return;
    const textToSend = newMessage;
    setNewMessage('');
    setSending(true);

    try {
      const sent = await chatService.envoyerMessage(activeConv.id, textToSend);
      setMessages((prev) => [...prev, sent]);

      // Mettre à jour le résumé de la conversation dans la liste de gauche
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConv.id
            ? { ...c, dernierMessage: textToSend, dernierMessageDate: new Date().toISOString() }
            : c
        )
      );
    } catch {
      toast.error("Impossible d'envoyer le message.");
      setNewMessage(textToSend);
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter((c) =>
    (c.titre || '').toLowerCase().includes(searchFilter.toLowerCase()) ||
    (c.interlocuteurNom || '').toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="st-chat-container" style={{
      display: 'flex',
      height: 'calc(100vh - 120px)',
      backgroundColor: '#FFFFFF',
      borderRadius: '12px',
      border: '1px solid #E2E8F0',
      overflow: 'hidden',
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
    }}>
      {/* VOLET GAUCHE : LISTE DES CONVERSATIONS */}
      <div style={{
        width: '340px',
        borderRight: '1px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#F8FAFC',
      }}>
        {/* EN-TÊTE LISTE */}
        <div style={{ padding: '16px', borderBottom: '1px solid #E2E8F0', backgroundColor: '#FFFFFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#1A202C' }}>
              Messagerie & Négociations
            </h2>
            <button
              onClick={fetchConversations}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#718096' }}
              title="Actualiser"
            >
              <FiRefreshCw size={15} />
            </button>
          </div>

          <div style={{ position: 'relative' }}>
            <FiSearch style={{ position: 'absolute', left: 10, top: 10, color: '#A0AEC0' }} />
            <input
              type="text"
              placeholder="Rechercher un contact ou une offre..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 34px',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                fontSize: '0.85rem',
                backgroundColor: '#F7FAFC',
              }}
            />
          </div>
        </div>

        {/* LISTE SCROLLABLE */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#718096' }}>Chargement...</div>
          ) : filteredConversations.length === 0 ? (
            <div style={{ padding: '32px 16px', textAlign: 'center', color: '#A0AEC0', fontSize: '0.9rem' }}>
              Aucune conversation trouvée.
            </div>
          ) : (
            filteredConversations.map((c) => {
              const isActive = activeConv?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => setActiveConv(c)}
                  style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid #EDF2F7',
                    cursor: 'pointer',
                    backgroundColor: isActive ? '#EBF4FF' : '#FFFFFF',
                    borderLeft: isActive ? '4px solid #1A3A5C' : '4px solid transparent',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                    <span style={{ fontWeight: isActive ? 700 : 600, color: '#2D3748', fontSize: '0.9rem' }}>
                      {c.interlocuteurNom || 'Contact'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#A0AEC0' }}>
                      {c.dernierMessageDate ? new Date(c.dernierMessageDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: '#4A5568', fontWeight: 500, marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {c.titre}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: '#718096', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '210px' }}>
                      {c.dernierMessage || 'Nouvelle conversation...'}
                    </span>
                    {c.nonLusCount > 0 && (
                      <span style={{
                        backgroundColor: '#E53E3E',
                        color: '#FFFFFF',
                        borderRadius: '10px',
                        padding: '2px 7px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                      }}>
                        {c.nonLusCount}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* VOLET DROIT : ZONE DE TCHAT ACTIVE */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF' }}>
        {activeConv ? (
          <>
            {/* EN-TÊTE DE LA CONVERSATION */}
            <div style={{
              padding: '14px 20px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  backgroundColor: '#1A3A5C',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '1rem',
                }}>
                  {(activeConv.interlocuteurNom || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#1A202C' }}>
                    {activeConv.interlocuteurNom}
                  </h3>
                  <div style={{ fontSize: '0.8rem', color: '#718096', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Badge variant="info">{activeConv.interlocuteurRole || 'PARTENAIRE'}</Badge>
                    <span>• {activeConv.titre}</span>
                  </div>
                </div>
              </div>

              {/* ACTIONS LIÉES (CONTRAT, OFFRE) */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsContractModalOpen(true)}
                  style={{ gap: 6, fontSize: '0.8rem' }}
                >
                  <FiFileText /> Consulter le Contrat
                </Button>
              </div>
            </div>

            {/* FIL DES MESSAGES */}
            <div style={{
              flex: 1,
              padding: '20px',
              overflowY: 'auto',
              backgroundColor: '#F8FAFC',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}>
              {messages.length === 0 ? (
                <div style={{ margin: 'auto', textAlign: 'center', color: '#A0AEC0', fontSize: '0.9rem' }}>
                  <FiMessageSquare size={36} style={{ display: 'block', margin: '0 auto 10px auto' }} />
                  Début de la conversation sécurisée. Posez vos questions logistiques, négociez ou confirmez vos horaires.
                </div>
              ) : (
                messages.map((m) => {
                  const isMe = m.estMoi || m.expediteurNom === 'Moi';
                  return (
                    <div
                      key={m.id}
                      style={{
                        alignSelf: isMe ? 'flex-end' : 'flex-start',
                        maxWidth: '70%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isMe ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <div style={{
                        padding: '10px 14px',
                        borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                        backgroundColor: isMe ? '#1A3A5C' : '#FFFFFF',
                        color: isMe ? '#FFFFFF' : '#2D3748',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                        border: isMe ? 'none' : '1px solid #E2E8F0',
                        fontSize: '0.9rem',
                        lineHeight: 1.45,
                        wordBreak: 'break-word',
                      }}>
                        {m.contenu}
                      </div>
                      <div style={{
                        fontSize: '0.72rem',
                        color: '#A0AEC0',
                        marginTop: '3px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}>
                        <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {isMe && <FiCheck size={12} color="#48BB78" />}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* ZONE DE SAISIE */}
            <form
              onSubmit={handleSendMessage}
              style={{
                padding: '14px 18px',
                borderTop: '1px solid #E2E8F0',
                display: 'flex',
                gap: '10px',
                alignItems: 'center',
                backgroundColor: '#FFFFFF',
              }}
            >
              <input
                type="text"
                placeholder="Écrivez votre message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '24px',
                  border: '1px solid #CBD5E0',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  backgroundColor: newMessage.trim() ? '#1A3A5C' : '#CBD5E0',
                  color: '#FFFFFF',
                  border: 'none',
                  cursor: newMessage.trim() ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.15s ease',
                }}
              >
                <FiSend size={16} />
              </button>
            </form>
          </>
        ) : (
          <div style={{ margin: 'auto', textAlign: 'center', color: '#A0AEC0' }}>
            <FiMessageSquare size={48} style={{ display: 'block', margin: '0 auto 12px auto' }} />
            Sélectionnez une conversation pour échanger avec votre interlocuteur.
          </div>
        )}
      </div>

      {/* MODAL CONTRAT DE TRANSPORT */}
      <ContratModal
        isOpen={isContractModalOpen}
        onClose={() => setIsContractModalOpen(false)}
        offreId={activeConv?.offreId}
      />
    </div>
  );
};

export default ChatPage;
