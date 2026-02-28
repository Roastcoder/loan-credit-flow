import { useState } from 'react';
import { Plus, Search, Check, CreditCard as CreditCardIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import { useRole } from '@/contexts/RoleContext';
import { mockCreditCards } from '@/data/mockData';
import { CreditCardProduct } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

const CARD_IMAGES: Record<string, string> = {};

const CARD_FEATURES: Record<string, string[]> = {};

const CreditCards = () => {
  const { role, permissions } = useRole();
  const navigate = useNavigate();
  const [cards, setCards] = useState<CreditCardProduct[]>(mockCreditCards);
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [newCard, setNewCard] = useState({
    name: '', bank: '', category: 'credit_card', commission: '', redirectUrl: '', payoutSource: '',
    status: true, variantImage: null as File | null, cardImage: null as File | null,
    pincodes: '', highlights: '', terms: ''
  });

  const filteredCards = cards.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.bank.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddCard = () => {
    const card: CreditCardProduct = {
      id: String(cards.length + 1), name: newCard.name, bank: newCard.bank, type: newCard.category,
      annualFee: 0, joiningFee: 0, dsaCommission: Number(newCard.commission),
      rewardPoints: newCard.highlights, status: newCard.status ? 'active' : 'inactive',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCards([...cards, card]);
    setNewCard({
      name: '', bank: '', category: 'credit_card', commission: '', redirectUrl: '', payoutSource: '',
      status: true, variantImage: null, cardImage: null, pincodes: '', highlights: '', terms: ''
    });
    setIsOpen(false);
  };

  return (
    <AppLayout>
      <div className="space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">Credit Cards</h1>
            <p className="text-muted-foreground mt-0.5 text-sm">
              {role === 'dsa_partner' ? 'View products & commissions' : 'Manage credit card products'}
            </p>
          </div>
          {permissions.creditCards.add && (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="gradient-accent text-accent-foreground border-0 hover:opacity-90 w-full md:w-auto">
                  <Plus className="w-4 h-4 mr-2" /> Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle className="font-display">Add New Product</DialogTitle></DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <Label>Bank Name</Label>
                    <Select value={newCard.bank} onValueChange={(v) => setNewCard({ ...newCard, bank: v })}>
                      <SelectTrigger><SelectValue placeholder="-- Select Bank --" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HDFC Bank">HDFC Bank</SelectItem>
                        <SelectItem value="ICICI Bank">ICICI Bank</SelectItem>
                        <SelectItem value="SBI">SBI</SelectItem>
                        <SelectItem value="Axis Bank">Axis Bank</SelectItem>
                        <SelectItem value="Kotak Mahindra Bank">Kotak Mahindra Bank</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <Button variant="outline" onClick={() => setIsOpen(false)} className="flex-1">Cancel</Button>
                    <Button onClick={handleAddCard} className="flex-1 gradient-accent text-accent-foreground border-0">Add Product</Button>
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

        {/* Card Grid — horizontal card+info layout like reference */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredCards.map(card => {
            const features = CARD_FEATURES[card.id] || ['Premium benefits', 'Reward points', 'Low interest rates'];
            return (
              <button
                key={card.id}
                onClick={() => navigate(`/credit-cards/${card.id}`)}
                className="bg-card rounded-xl border border-border shadow-card overflow-hidden text-left hover:shadow-elevated hover:border-accent/20 transition-all duration-200 group"
              >
                <div className="flex flex-row">
                  {/* Card Image */}
                  <div className="w-36 sm:w-44 flex-shrink-0 bg-muted/30 flex items-center justify-center p-4">
                    <img
                      src={CARD_IMAGES[card.id] || CARD_IMAGES['1']}
                      alt={card.name}
                      className="w-full h-auto rounded-lg object-cover shadow-elevated group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Card Info */}
                  <div className="flex-1 p-4 min-w-0">
                    <p className="text-xs font-semibold text-accent">{card.bank}</p>
                    <h3 className="text-base font-display font-bold text-card-foreground mt-0.5 truncate">{card.name}</h3>

                    <ul className="mt-3 space-y-1.5">
                      {features.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <Check className="w-3.5 h-3.5 text-accent mt-0.5 flex-shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>

                    {(role === 'dsa_partner' || role === 'super_admin' || role === 'admin') && (
                      <p className="mt-3 text-xs font-bold text-accent">Commission: ₹{card.dsaCommission.toLocaleString()}</p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
};

export default CreditCards;
