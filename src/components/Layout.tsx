// File: src/components/SearchBarWithSuggestions.tsx
import React, { useState, useEffect, useRef } from 'react';

type SearchItem = {
  id: string;
  type: 'recipe' | 'event' | 'tutorial' | 'subscription';
  title: string;
};

type Props = {
  onSearchSubmit: (query: string) => void;
  onSuggestionClick: (item: SearchItem) => void;
  fetchSearchSuggestions: (query: string) => Promise<SearchItem[]>;
};

const SearchBarWithSuggestions: React.FC<Props> = ({ onSearchSubmit, onSuggestionClick, fetchSearchSuggestions }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchItem[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const activeSuggestionIndex = useRef(-1);

  useEffect(() => {
    if (query.trim()) {
      fetchSearchSuggestions(query).then(setSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [query, fetchSearchSuggestions]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (activeSuggestionIndex.current < suggestions.length - 1) {
        activeSuggestionIndex.current += 1;
        scrollToActive();
        setQuery(suggestions[activeSuggestionIndex.current]?.title || query);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (activeSuggestionIndex.current > 0) {
        activeSuggestionIndex.current -= 1;
        scrollToActive();
        setQuery(suggestions[activeSuggestionIndex.current]?.title || query);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      activeSuggestionIndex.current = -1;
      setSuggestions([]);
      onSearchSubmit(query);
    } else if (e.key === 'Escape') {
      activeSuggestionIndex.current = -1;
      setSuggestions([]);
    }
  };

  const scrollToActive = () => {
    const el = document.getElementById(`suggestion-${activeSuggestionIndex.current}`);
    if (el) el.scrollIntoView({ block: 'nearest' });
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <input
        type="text"
        className="w-full rounded-md border border-gray-300 px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        placeholder="Αναζήτηση σε ολόκληρη την εφαρμογή..."
        value={query}
        onChange={e => {
          setQuery(e.target.value);
          activeSuggestionIndex.current = -1;
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        aria-label="Search input"
      />
      {isFocused && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full max-h-64 overflow-auto rounded-md bg-white border border-gray-300 shadow-lg mt-1">
          {suggestions.map((item, index) => (
            <li
              key={item.id}
              id={`suggestion-${index}`}
              className={`cursor-pointer px-4 py-2 hover:bg-primary/20 ${
                index === activeSuggestionIndex.current ? 'bg-primary/30' : ''
              }`}
              onMouseDown={() => {
                setQuery(item.title);
                setSuggestions([]);
                onSuggestionClick(item);
              }}
            >
              <span className="font-semibold capitalize">{item.type}</span>: {item.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBarWithSuggestions;


// File: src/features/SearchResultsPage.tsx
import React, { useEffect, useState } from 'react';

type SearchItem = {
  id: string;
  type: 'recipe' | 'event' | 'tutorial' | 'subscription';
  title: string;
  description?: string;
};

type Props = {
  query: string;
  fetchSearchResults: (query: string) => Promise<SearchItem[]>;
};

const SearchResultsPage: React.FC<Props> = ({ query, fetchSearchResults }) => {
  const [results, setResults] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim()) {
      setLoading(true);
      fetchSearchResults(query)
        .then(data => setResults(data))
        .finally(() => setLoading(false));
    } else {
      setResults([]);
    }
  }, [query, fetchSearchResults]);

  if (loading) return <div className="text-center py-8">Φόρτωση αποτελεσμάτων...</div>;
  if (!results.length) return <div className="text-center py-8">Δεν βρέθηκαν αποτελέσματα για "{query}".</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Αποτελέσματα Αναζήτησης για: "{query}"</h2>
      <ul>
        {results.map(item => (
          <li key={item.id} className="border-b py-2 last:border-b-0 cursor-pointer hover:bg-gray-100 rounded px-2">
            <strong className="capitalize">{item.type}</strong>: {item.title}
            {item.description && <p className="text-sm text-gray-600">{item.description}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchResultsPage;


// File: src/Layout.tsx
import React, { useState } from 'react';
import Navigation from './Navigation';
import { Recipes } from './features/Recipes';
import { Events } from './features/Events';
import { Tutorials } from './features/Tutorials';
import { Subscriptions } from './features/Subscriptions';
import WorkSchedule from './features/WorkSchedule';
import CustomizableDashboard from './dashboard/CustomizableDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChefHat, Users, Calendar, BookOpen, Star, Zap, Shield } from 'lucide-react';

import SearchBarWithSuggestions from '@/components/SearchBarWithSuggestions';
import SearchResultsPage from '@/features/SearchResultsPage';

type SearchItem = {
  id: string;
  type: 'recipe' | 'event' | 'tutorial' | 'subscription';
  title: string;
  description?: string;
};

const Layout: React.FC = () => {
  const [currentSection, setCurrentSection] = useState('home');

  // Search State
  const [searchActive, setSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResultItem, setSearchResultItem] = useState<SearchItem | null>(null);

  // Fetch suggestions - replace mock data or replace with backend calls
  const fetchSearchSuggestions = async (query: string): Promise<SearchItem[]> => {
    const mockData: SearchItem[] = [
      { id: 'r1', type: 'recipe', title: 'Πίτσα Μαργαρίτα' },
      { id: 'r2', type: 'recipe', title: 'Σπαγγέτι Μπολονέζ' },
      { id: 'e1', type: 'event', title: 'Σεμινάριο Ιταλικής Κουζίνας' },
      { id: 't1', type: 'tutorial', title: 'Μαγειρική Βασικών Τεχνικών' },
      { id: 's1', type: 'subscription', title: 'Premium Συνδρομή' },
    ];
    return mockData.filter(item => item.title.toLowerCase().includes(query.toLowerCase()));
  };

  // Fetch full search results - replace with API calls if needed
  const fetchSearchResults = async (query: string): Promise<SearchItem[]> => {
    return fetchSearchSuggestions(query);
  };

  const handleSearchSubmit = (query: string) => {
    setSearchQuery(query);
    setSearchActive(true);
    setSearchResultItem(null);
  };

  const handleSuggestionClick = (item: SearchItem) => {
    setSearchResultItem(item);
    setSearchActive(true);
    setSearchQuery(item.title);
  };

  const renderContent = () => {
    switch (currentSection) {
      case 'recipes':
        return <Recipes />;
      case 'events':
        return <Events />;
      case 'tutorials':
        return <Tutorials />;
      case 'work-schedule':
        return <WorkSchedule />;
      case 'subscriptions':
        return <Subscriptions />;
      case 'profile':
        return (
          <div className="text-center py-12">
            <div className="h-16 w-16 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center mx-auto mb-4 shadow-warm">
              <ChefHat className="h-8 w-8 text-primary-foreground" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Προφίλ Χρήστη</h3>
            <p className="text-muted-foreground mb-4">Εδώ θα εμφανίζεται η σελίδα διαχείρισης προφίλ</p>
            <Badge variant="secondary">Σύντομα Διαθέσιμο</Badge>
          </div>
        );
      case 'home':
      default:
        return (
          <div className="space-y-12">
            <div className="text-center space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-bold">
                  <span className="bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
                    SpreadIt
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
                  Η κοινότητα που ενώνει επαγγελματίες μάγειρες και λάτρεις της μαγειρικής. Συνταγές, εκδηλώσεις, tutorials και
                  εργασιακά εργαλεία σε μία πλατφόρμα.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card
                className="cursor-pointer hover:shadow-warm transition-all duration-300 border-2 hover:border-primary/20"
                onClick={() => setCurrentSection('recipes')}
              >
                <CardHeader className="text-center">
                  <div className="h-12 w-12 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center mx-auto mb-2 shadow-warm">
                    <ChefHat className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <CardTitle>Συνταγές</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center">Εκατοντάδες συνταγές από επαγγελματίες μάγειρες. Δωρεάν και premium περιεχόμενο.</p>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-warm transition-all duration-300 border-2 hover:border-primary/20"
                onClick={() => setCurrentSection('events')}
              >
                <CardHeader className="text-center">
                  <div className="h-12 w-12 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center mx-auto mb-2 shadow-warm">
                    <Calendar className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <CardTitle>Εκδηλώσεις</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center">Workshops, διαγωνισμοί και networking events στην περιοχή σας.</p>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-warm transition-all duration-300 border-2 hover:border-primary/20"
                onClick={() => setCurrentSection('tutorials')}
              >
                <CardHeader className="text-center">
                  <div className="h-12 w-12 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center mx-auto mb-2 shadow-warm">
                    <BookOpen className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <CardTitle>Tutorials</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center">Μάθετε νέες τεχνικές με βίντεο tutorials από έμπειρους chefs.</p>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-warm transition-all duration-300 border-2 hover:border-primary/20"
                onClick={() => setCurrentSection('work-schedule')}
              >
                <CardHeader className="text-center">
                  <div className="h-12 w-12 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center mx-auto mb-2 shadow-warm">
                    <Users className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <CardTitle>Εργασία</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center">Καταγραφή ωρών και υπολογισμός μισθού σύμφωνα με τον Ελληνικό νόμο.</p>
                </CardContent>
              </Card>
            </div>

            <div className="bg-gradient-warm rounded-2xl p-8 border shadow-elegant">
              <h2 className="text-3xl font-bold text-center mb-8">Γιατί να Επιλέξετε το SpreadIt;</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center space-y-4">
                  <div className="h-12 w-12 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center mx-auto shadow-warm">
                    <Star className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold">Επαγγελματικό Δίκτυο</h3>
                  <p className="text-muted-foreground">
                    Συνδεθείτε με επαγγελματίες μάγειρες, μοιραστείτε εμπειρίες και αναπτύξτε τη καριέρα σας.
                  </p>
                </div>
                <div className="text-center space-y-4">
                  <div className="h-12 w-12 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center mx-auto shadow-warm">
                    <Zap className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold">Εργαλεία Εργασίας</h3>
                  <p className="text-muted-foreground">
                    Καταγραφή ωρών, υπολογισμός μισθού και διαχείριση εργασιακών δεδομένων με Ελληνικό νομικό πλαίσιο.
                  </p>
                </div>
                <div className="text-center space-y-4">
                  <div className="h-12 w-12 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center mx-auto shadow-warm">
                    <Shield className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold">Επαληθευμένο Περιεχόμενο</h3>
                  <p className="text-muted-foreground">
                    Συνταγές και tutorials από επαληθευμένους επαγγελματίες με έλεγχο ποιότητας.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center bg-card rounded-2xl p-8 border shadow-elegant">
              <h2 className="text-2xl font-bold mb-4">Είστε Έτοιμοι να Ξεκινήσετε;</h2>
              <p className="text-muted-foreground mb-6">Εγγραφείτε σήμερα και αποκτήστε πρόσβαση σε όλες τις δυνατότητες του SpreadIt.</p>
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Εγγραφή Τώρα
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-warm">
      <Navigation currentSection={currentSection} onSectionChange={setCurrentSection} />
      
      <header className="container mx-auto px-4 py-4">
        <SearchBarWithSuggestions
          onSearchSubmit={handleSearchSubmit}
          onSuggestionClick={handleSuggestionClick}
          fetchSearchSuggestions={fetchSearchSuggestions}
        />
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {searchActive ? (
          searchResultItem ? (
            <div>
              <h2>Επιλεγμένο αποτέλεσμα:</h2>
              <p>
                {searchResultItem.type}: {searchResultItem.title}
              </p>
            </div>
          ) : (
            <SearchResultsPage query={searchQuery} fetchSearchResults={fetchSearchResults} />
          )
        ) : (
          renderContent()
        )}
      </main>
    </div>
  );
};

export default Layout;
