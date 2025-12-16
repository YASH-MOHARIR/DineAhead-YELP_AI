// components/Preferences.tsx
import type  { UserPreferences } from '../types';
import { DIETARY_OPTIONS, ALLERGEN_OPTIONS, CUISINE_OPTIONS } from '../constants';

interface PreferencesProps {
  preferences: UserPreferences;
  setPreferences: (p: UserPreferences) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Preferences({ preferences, setPreferences, onNext, onBack }: PreferencesProps) {
  const toggleAllergen = (a: string) => {
    const updated = preferences.allergens.includes(a) 
      ? preferences.allergens.filter(x => x !== a) 
      : [...preferences.allergens, a];
    setPreferences({ ...preferences, allergens: updated });
  };

  const toggleCuisine = (cuisine: string, type: 'like' | 'dislike') => {
    if (type === 'like') {
      const inD = preferences.cuisineDislikes.includes(cuisine);
      const inL = preferences.cuisineLikes.includes(cuisine);
      setPreferences({ 
        ...preferences, 
        cuisineLikes: inL ? preferences.cuisineLikes.filter(c => c !== cuisine) : [...preferences.cuisineLikes, cuisine], 
        cuisineDislikes: inD ? preferences.cuisineDislikes.filter(c => c !== cuisine) : preferences.cuisineDislikes 
      });
    } else {
      const inL = preferences.cuisineLikes.includes(cuisine);
      const inD = preferences.cuisineDislikes.includes(cuisine);
      setPreferences({ 
        ...preferences, 
        cuisineDislikes: inD ? preferences.cuisineDislikes.filter(c => c !== cuisine) : [...preferences.cuisineDislikes, cuisine], 
        cuisineLikes: inL ? preferences.cuisineLikes.filter(c => c !== cuisine) : preferences.cuisineLikes 
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <button onClick={onBack} className="text-gray-500 mb-4 hover:text-gray-700">← Back</button>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Preferences</h1>
        <p className="text-gray-600 mb-8">Tell us about your dietary needs and taste</p>

        {/* Dietary Preference */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h2 className="font-semibold text-gray-800 mb-4">Dietary Preference</h2>
          <div className="grid grid-cols-2 gap-3">
            {DIETARY_OPTIONS.map(opt => (
              <button 
                key={opt.value} 
                onClick={() => setPreferences({ 
                  ...preferences, 
                  dietary: preferences.dietary === opt.value ? null : opt.value 
                })}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  preferences.dietary === opt.value 
                    ? 'border-orange-500 bg-orange-50 text-orange-700' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Allergens */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h2 className="font-semibold text-gray-800 mb-4">Allergens to Avoid</h2>
          <div className="flex flex-wrap gap-2">
            {ALLERGEN_OPTIONS.map(a => (
              <button 
                key={a} 
                onClick={() => toggleAllergen(a)}
                className={`px-4 py-2 rounded-full text-sm transition-all ${
                  preferences.allergens.includes(a) 
                    ? 'bg-red-100 text-red-700 border-2 border-red-300' 
                    : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        {/* Cuisine Preferences */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h2 className="font-semibold text-gray-800 mb-2">Cuisine Preferences</h2>
          <p className="text-sm text-gray-500 mb-4">Tap once to like 👍, tap again to dislike 👎</p>
          <div className="flex flex-wrap gap-2">
            {CUISINE_OPTIONS.map(c => {
              const isL = preferences.cuisineLikes.includes(c);
              const isD = preferences.cuisineDislikes.includes(c);
              let cn = 'px-4 py-2 rounded-full text-sm transition-all ';
              if (isL) cn += 'bg-green-100 text-green-700 border-2 border-green-300';
              else if (isD) cn += 'bg-red-100 text-red-700 border-2 border-red-300';
              else cn += 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200';
              
              return (
                <button 
                  key={c} 
                  onClick={() => toggleCuisine(c, isL ? 'dislike' : 'like')} 
                  className={cn}
                >
                  {isL && '👍 '}{isD && '👎 '}{c}
                </button>
              );
            })}
          </div>
        </div>

        <button 
          onClick={onNext} 
          className="w-full bg-orange-500 text-white py-4 rounded-xl font-semibold hover:bg-orange-600 transition-all"
        >
          Continue to Budget →
        </button>
      </div>
    </div>
  );
}