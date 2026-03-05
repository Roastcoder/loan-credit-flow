import { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Search, Check, CreditCard as CreditCardIcon, Edit, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import { useRole } from '@/contexts/RoleContext';
import { CreditCardProduct } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { api } from '@/services/api';

const CARD_IMAGES: Record<string, string> = {};

const CARD_FEATURES: Record<string, string[]> = {};

const CreditCards = () => {
  const { role, permissions } = useRole();
  const navigate = useNavigate();
  const [cards, setCards] = useState<CreditCardProduct[]>([]);
  const [displayedCards, setDisplayedCards] = useState<CreditCardProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBank, setSelectedBank] = useState('all');
  const [page, setPage] = useState(1);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const CARDS_PER_PAGE = 10;
  const [isOpen, setIsOpen] = useState(false);
  const [editCard, setEditCard] = useState<CreditCardProduct | null>(null);
  const [banks, setBanks] = useState<any[]>([]);
  const [customBankInput, setCustomBankInput] = useState('');
  const [newCard, setNewCard] = useState({
    name: '', bank: '', category: 'credit_card', commission: '', redirectUrl: '', payoutSource: '',
    status: true, variantImage: null as File | null, cardImage: null as File | null,
    pincodes: '', highlights: '', terms: ''
  });

  useEffect(() => {
    fetchCards();
    fetchBanks();
  }, []);

  useEffect(() => {
    let filtered = cards;
    
    // Filter by search
    if (search) {
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) || c.bank.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Filter by category (all cards are credit_card type)
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(c => c.type === selectedCategory);
    }
    
    // Filter by bank
    if (selectedBank !== 'all') {
      filtered = filtered.filter(c => c.bank === selectedBank);
    }
    
    setDisplayedCards(filtered.slice(0, CARDS_PER_PAGE));
    setPage(1);
  }, [search, selectedCategory, selectedBank, cards]);

  useEffect(() => {
    if (!loadMoreRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    observerRef.current.observe(loadMoreRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [displayedCards, loadingMore]);

  const loadMore = useCallback(() => {
    let filtered = cards;
    
    if (search) {
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) || c.bank.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(c => c.type === selectedCategory);
    }
    
    if (selectedBank !== 'all') {
      filtered = filtered.filter(c => c.bank === selectedBank);
    }
    
    const nextPage = page + 1;
    const newCards = filtered.slice(0, nextPage * CARDS_PER_PAGE);
    
    if (newCards.length > displayedCards.length) {
      setLoadingMore(true);
      setTimeout(() => {
        setDisplayedCards(newCards);
        setPage(nextPage);
        setLoadingMore(false);
      }, 300);
    }
  }, [cards, search, selectedCategory, selectedBank, page, displayedCards.length]);

  const fetchBanks = async () => {
    try {
      const data = await api.getBanks();
      setBanks(data.banks || []);
    } catch (error) {
      console.error('Failed to fetch banks:', error);
    }
  };

  const fetchCards = async () => {
    setLoading(true);
    try {
      const data = await api.getCreditCards();
      setCards(data.records || []);
    } catch (error) {
      console.error('Failed to fetch cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCards = cards.filter(c => {
    let matches = true;
    if (search) {
      matches = matches && (c.name.toLowerCase().includes(search.toLowerCase()) || c.bank.toLowerCase().includes(search.toLowerCase()));
    }
    if (selectedCategory !== 'all') {
      matches = matches && c.type === selectedCategory;
    }
    if (selectedBank !== 'all') {
      matches = matches && c.bank === selectedBank;
    }
    return matches;
  });
  const hasMore = displayedCards.length < filteredCards.length;

  const handleAddCard = async () => {
    try {
      if (newCard.bank === 'custom' && customBankInput) {
        await api.createBank({ name: customBankInput });
        await fetchBanks();
      }

      if (editCard) {
        await api.updateCreditCard(editCard.id, {
          name: newCard.name,
          bank: newCard.bank === 'custom' ? customBankInput : newCard.bank,
          type: newCard.category,
          dsa_commission: Number(newCard.commission),
          reward_points: newCard.highlights,
          redirect_url: newCard.redirectUrl,
          payout_source: newCard.payoutSource,
          status: newCard.status ? 'active' : 'inactive',
        });
      } else {
        await api.createCreditCard({
          name: newCard.name,
          bank: newCard.bank === 'custom' ? customBankInput : newCard.bank,
          type: newCard.category,
          dsa_commission: Number(newCard.commission),
          reward_points: newCard.highlights,
          redirect_url: newCard.redirectUrl,
          payout_source: newCard.payoutSource,
          pincodes: newCard.pincodes,
          terms: newCard.terms,
          status: newCard.status ? 'active' : 'inactive',
        });
      }
      await fetchCards();
      setNewCard({
        name: '', bank: '', category: 'credit_card', commission: '', redirectUrl: '', payoutSource: '',
        status: true, variantImage: null, cardImage: null, pincodes: '', highlights: '', terms: ''
      });
      setCustomBankInput('');
      setEditCard(null);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to save card:', error);
    }
  };

  return (
    <AppLayout >
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">Credit Cards</h1>
            <p className="text-muted-foreground mt-0.5 text-sm">
              {role === 'dsa_partner' ? 'View products & commissions' : 'Manage credit card products'}
            </p>
          </div>
          {permissions.creditCards.add && (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="gradient-accent mr-3 text-accent-foreground border-0 hover:opacity-90">
                  <Plus className="w-4 h-4 mr-3" /> Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle className="font-display">{editCard ? 'Edit Product' : 'Add New Product'}</DialogTitle></DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Bank Name</Label>
                    <div className="space-y-2">
                      <Select value={newCard.bank} onValueChange={(v) => setNewCard({ ...newCard, bank: v })}>
                        <SelectTrigger><SelectValue placeholder="-- Select Bank --" /></SelectTrigger>
                        <SelectContent>
                          {banks.map(bank => (
                            <SelectItem key={bank.id} value={bank.name}>{bank.name}</SelectItem>
                          ))}
                          <SelectItem value="custom">+ Add Custom Bank</SelectItem>
                        </SelectContent>
                      </Select>
                      {newCard.bank === 'custom' && (
                        <Input 
                          placeholder="Enter custom bank name" 
                          value={customBankInput}
                          onChange={e => setCustomBankInput(e.target.value)}
                          autoFocus
                        />
                      )}
                    </div>
                  </div>
                  <div>
                    <Label>Product Name *</Label>
                    <Input value={newCard.name} onChange={e => setNewCard({ ...newCard, name: e.target.value })} placeholder="Enter product name" required />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <div className="flex items-center gap-2 p-3 border rounded-lg bg-muted/30">
                      <CreditCardIcon className="w-5 h-5 text-accent" />
                      <span className="font-medium">💳 Credit Card</span>
                    </div>
                  </div>
                  <div>
                    <Label>Commission</Label>
                    <Input type="number" value={newCard.commission} onChange={e => setNewCard({ ...newCard, commission: e.target.value })} placeholder="Enter commission amount" />
                  </div>
                  <div>
                    <Label>Bank Redirect URL *</Label>
                    <Input value={newCard.redirectUrl} onChange={e => setNewCard({ ...newCard, redirectUrl: e.target.value })} placeholder="https://bank.com/apply" required />
                  </div>
                  <div>
                    <Label>Payout Source</Label>
                    <Input value={newCard.payoutSource} onChange={e => setNewCard({ ...newCard, payoutSource: e.target.value })} placeholder="Enter payout source" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Status</Label>
                    <div className="flex items-center gap-2">
                      <Switch checked={newCard.status} onCheckedChange={(checked) => setNewCard({ ...newCard, status: checked })} />
                      <span className="text-sm">{newCard.status ? '✅ Active' : '❌ Inactive'}</span>
                    </div>
                  </div>
                  <div>
                    <Label>Variant Image</Label>
                    <Input type="file" accept="image/*" onChange={e => setNewCard({ ...newCard, variantImage: e.target.files?.[0] || null })} />
                  </div>
                  <div>
                    <Label>Card Image</Label>
                    <Input type="file" accept="image/*" onChange={e => setNewCard({ ...newCard, cardImage: e.target.files?.[0] || null })} />
                  </div>
                  <div>
                    <Label>Serviceable Pin Codes (Bulk paste supported)</Label>
                    <Textarea
                      value={newCard.pincodes}
                      onChange={e => setNewCard({ ...newCard, pincodes: e.target.value })}
                      placeholder="Paste bulk pincodes separated by comma, space, or new line&#10;e.g. 110001, 110002, 110003&#10;or: 110001 110002 110003&#10;or: 110001&#10;110002&#10;110003&#10;or type ALL for all pincodes"
                      rows={4}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Auto-formats 6-digit pincodes. Supports bulk paste.</p>
                  </div>
                  <div>
                    <Label>Product Highlights</Label>
                    <Textarea value={newCard.highlights} onChange={e => setNewCard({ ...newCard, highlights: e.target.value })} placeholder="Enter product highlights" rows={3} />
                  </div>
                  <div>
                    <Label>Terms &amp; Conditions</Label>
                    <Textarea value={newCard.terms} onChange={e => setNewCard({ ...newCard, terms: e.target.value })} placeholder="Enter terms and conditions" rows={3} />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" onClick={() => { setIsOpen(false); setEditCard(null); }} className="flex-1">Cancel</Button>
                    <Button onClick={handleAddCard} className="flex-1 gradient-accent text-accent-foreground border-0">{editCard ? 'Update' : 'Add'} Product</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name or bank..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>

        {/* Bank Filters */}
        <div className='w-[90vw] md:w-[70vw] lg:w-[80vw] overflow-hidden py-2 overflow-x-scroll scrollbar-hide'> 
          <div className="flex gap-2 px-4md:px-6 lg:px-8 pb-2">
            <Button
              size="sm"
              variant={selectedBank === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedBank('all')}
              className={`whitespace-nowrap flex-shrink-0 ${selectedBank === 'all' ? 'gradient-accent text-accent-foreground border-0' : ''}`}
            >
              All
            </Button>
            {[...new Set(cards.map(c => c.bank))].sort().map(bank => (
              <Button
                key={bank}
                size="sm"
                variant={selectedBank === bank ? 'default' : 'outline'}
                onClick={() => setSelectedBank(bank)}
                className={`whitespace-nowrap flex-shrink-0 ${selectedBank === bank ? 'gradient-accent text-accent-foreground border-0' : ''}`}
              >
                {bank}
              </Button>
            ))}
          </div>
        </div>
       

        {/* Card Display */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
              <p className="text-muted-foreground mt-4">Loading credit cards...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile View - All Category */}
            {selectedBank === 'all' ? (
              <div className="md:hidden space-y-4">
                {displayedCards.map(card => {
                  const features = CARD_FEATURES[card.id] || ['Premium benefits', 'Reward points', 'Low interest rates'];
                  return (
                    <div key={card.id} className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
                      <div className="flex flex-row">
                        <div className="w-32 flex-shrink-0 bg-muted/30 flex items-center justify-center p-3">
                          <img
                            src={(card as any).card_image || '/cards/card_1758966564_4428.png'}
                            alt={card.name}
                            className="w-full h-auto rounded-lg shadow-lg"
                          />
                        </div>
                        <div className="flex-1 p-3 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-accent uppercase">{card.bank}</p>
                              <h3 className="text-sm font-display font-bold text-card-foreground mt-0.5 truncate">{card.name}</h3>
                            </div>
                            {(role === 'super_admin' || role === 'admin') && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditCard(card);
                                  setNewCard({
                                    name: card.name,
                                    bank: card.bank,
                                    category: 'credit_card',
                                    commission: String(card.dsa_commission || card.dsaCommission || 0),
                                    redirectUrl: (card as any).redirect_url || '',
                                    payoutSource: (card as any).payout_source || '',
                                    status: card.status === 'active',
                                    variantImage: null,
                                    cardImage: null,
                                    pincodes: (card as any).pincodes || '',
                                    highlights: card.reward_points || card.rewardPoints || '',
                                    terms: (card as any).terms || ''
                                  });
                                  setIsOpen(true);
                                }}
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </div>
                          <ul className="mt-2 space-y-1">
                            {features.slice(0, 2).map((f, i) => (
                              <li key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                                <Check className="w-3 h-3 text-accent mt-0.5 flex-shrink-0" />
                                <span className="line-clamp-1">{f}</span>
                              </li>
                            ))}
                          </ul>
                          {(role === 'dsa_partner' || role === 'super_admin' || role === 'admin') && (
                            <p className="mt-2 text-xs font-bold text-accent">₹{(card.dsaCommission || card.dsa_commission || 0).toLocaleString()}</p>
                          )}
                          <Button
                            onClick={() => {
                              const slug = card.name.toLowerCase().replace(/\s+/g, '-');
                              navigate(`/credit-cards/${slug}`);
                            }}
                            size="sm"
                            className="w-full mt-2 gradient-accent text-accent-foreground border-0 h-7 text-xs"
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="md:hidden w-[90vw]">
                <div className="overflow-x-auto scrollbar-hide snap-x snap-mandatory">
                  <div className="flex gap-4 px-4 pb-4">
                    {displayedCards.map(card => {
                      const features = CARD_FEATURES[card.id] || ['Premium benefits', 'Reward points', 'Low interest rates'];
                      return (
                        <div key={card.id} className="flex-shrink-0 w-[85vw] snap-start">
                          <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden h-full">
                            <div className="relative bg-gradient-to-br from-accent/10 to-muted/30 p-6 flex items-center justify-center group/card">
                              <img
                                src={(card as any).card_image || '/cards/card_1758966564_4428.png'}
                                alt={card.name}
                                className="w-48 h-auto transform -rotate-90 rounded-lg shadow-2xl transition-transform duration-300 hover:scale-105"
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  document.getElementById('card-scroll')?.scrollBy({ left: -300, behavior: 'smooth' });
                                }}
                                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity hover:bg-accent hover:text-accent-foreground"
                              >
                                <ChevronLeft className="w-5 h-5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  document.getElementById('card-scroll')?.scrollBy({ left: 300, behavior: 'smooth' });
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm border border-border flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity hover:bg-accent hover:text-accent-foreground"
                              >
                                <ChevronRight className="w-5 h-5" />
                              </button>
                            </div>
                            <div className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-accent uppercase">{card.bank}</p>
                                  <h3 className="text-base font-display font-bold text-card-foreground mt-1">{card.name}</h3>
                                </div>
                                {(role === 'super_admin' || role === 'admin') && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditCard(card);
                                      setNewCard({
                                        name: card.name,
                                        bank: card.bank,
                                        category: 'credit_card',
                                        commission: String(card.dsa_commission || card.dsaCommission || 0),
                                        redirectUrl: (card as any).redirect_url || '',
                                        payoutSource: (card as any).payout_source || '',
                                        status: card.status === 'active',
                                        variantImage: null,
                                        cardImage: null,
                                        pincodes: (card as any).pincodes || '',
                                        highlights: card.reward_points || card.rewardPoints || '',
                                        terms: (card as any).terms || ''
                                      });
                                      setIsOpen(true);
                                    }}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                              <ul className="space-y-2 mb-4">
                                {features.map((f, i) => (
                                  <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                                    <Check className="w-3.5 h-3.5 text-accent mt-0.5 flex-shrink-0" />
                                    <span>{f}</span>
                                  </li>
                                ))}
                              </ul>
                              {(role === 'dsa_partner' || role === 'super_admin' || role === 'admin') && (
                                <div className="pt-3 border-t border-border">
                                  <p className="text-xs font-bold text-accent">Commission: ₹{(card.dsaCommission || card.dsa_commission || 0).toLocaleString()}</p>
                                </div>
                              )}
                              <Button
                                onClick={() => {
                                  const slug = card.name.toLowerCase().replace(/\s+/g, '-');
                                  navigate(`/credit-cards/${slug}`);
                                }}
                                className="w-full mt-4 gradient-accent text-accent-foreground border-0"
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Desktop/Tablet Grid */}
            <div className="hidden md:grid grid-cols-1 lg:grid-cols-2 gap-4">
              {displayedCards.map(card => {
                const features = CARD_FEATURES[card.id] || ['Premium benefits', 'Reward points', 'Low interest rates'];
                return (
                  <button
                    key={card.id}
                    onClick={() => {
                      const slug = card.name.toLowerCase().replace(/\s+/g, '-');
                      navigate(`/credit-cards/${slug}`);
                    }}
                    className="bg-card rounded-xl border border-border shadow-card overflow-hidden text-left hover:shadow-elevated hover:border-accent/20 transition-all duration-200 group"
                  >
                    <div className="flex flex-row">
                      <div className="w-36 sm:w-44 flex-shrink-0 bg-muted/30 flex items-center justify-center p-4">
                        <img
                          src={(card as any).card_image || '/cards/card_1758966564_4428.png'}
                          alt={card.name}
                          className="w-full h-auto rounded-lg object-cover shadow-elevated group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex-1 p-4 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-accent">{card.bank}</p>
                            <h3 className="text-base font-display font-bold text-card-foreground mt-0.5 truncate">{card.name}</h3>
                          </div>
                          {(role === 'super_admin' || role === 'admin') && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditCard(card);
                                setNewCard({
                                  name: card.name,
                                  bank: card.bank,
                                  category: 'credit_card',
                                  commission: String(card.dsa_commission || card.dsaCommission || 0),
                                  redirectUrl: (card as any).redirect_url || '',
                                  payoutSource: (card as any).payout_source || '',
                                  status: card.status === 'active',
                                  variantImage: null,
                                  cardImage: null,
                                  pincodes: (card as any).pincodes || '',
                                  highlights: card.reward_points || card.rewardPoints || '',
                                  terms: (card as any).terms || ''
                                });
                                setIsOpen(true);
                              }}
                              className="ml-2"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        <ul className="mt-3 space-y-1.5">
                          {features.map((f, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                              <Check className="w-3.5 h-3.5 text-accent mt-0.5 flex-shrink-0" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                        {(role === 'dsa_partner' || role === 'super_admin' || role === 'admin') && (
                          <p className="mt-3 text-xs font-bold text-accent">Commission: ₹{(card.dsaCommission || card.dsa_commission || 0).toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
        
        {!loading && hasMore && (
          <div ref={loadMoreRef} className="flex justify-center py-8">
            {loadingMore && (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto"></div>
                <p className="text-muted-foreground text-sm mt-2">Loading more cards...</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default CreditCards;
