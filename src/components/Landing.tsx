// components/Landing.tsx
import { 
  UtensilsCrossed, 
  Bot, 
  Calendar, 
  Wallet, 
  CalendarCheck,
  BookOpen,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface LandingProps {
  onStart: () => void;
  savedPlansCount: number;
  onShowSavedPlans: () => void;
}

export default function Landing({ onStart, savedPlansCount, onShowSavedPlans }: LandingProps) {
  const features = [
    { icon: Bot, title: 'AI-Powered Planning', description: 'Chat naturally to discover restaurants that match your taste' },
    { icon: Calendar, title: 'Weekly Meal Plans', description: 'Drag and drop to build your perfect dining week' },
    { icon: Wallet, title: 'Budget Tracking', description: 'Stay on budget with real-time cost tracking' },
    { icon: CalendarCheck, title: 'Easy Reservations', description: 'Book tables or export to your calendar' }
  ];

  const steps = [
    { num: '1', text: 'Set preferences & budget' },
    { num: '2', text: 'Chat with AI assistant' },
    { num: '3', text: 'Build your weekly plan' },
    { num: '4', text: 'Book, save, or share' }
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-500 via-rose-500 to-purple-600 overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse-soft"></div>
        <div className="absolute top-1/3 -left-40 w-80 h-80 bg-yellow-300/20 rounded-full blur-3xl animate-pulse-soft delay-300"></div>
        <div className="absolute -bottom-40 right-1/4 w-72 h-72 bg-purple-300/20 rounded-full blur-3xl animate-pulse-soft delay-500"></div>
        <div className="absolute top-2/3 left-1/3 w-64 h-64 bg-rose-300/20 rounded-full blur-3xl animate-float"></div>
      </div>

      {/* Hero Section */}
      <div className="relative">
        <div className="max-w-6xl mx-auto px-6 pt-8 pb-20">
          {/* Header */}
          <div className="flex justify-between items-center mb-16 animate-fade-in-down">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-8 h-8 text-white animate-float" />
              <span className="text-white font-bold text-xl">DineAhead</span>
            </div>
            {savedPlansCount > 0 && (
              <button 
                onClick={onShowSavedPlans}
                className="glass-dark text-white px-4 py-2 rounded-full text-sm font-medium 
                           hover:bg-white/20 transition-all hover-lift flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>Saved Plans ({savedPlansCount})</span>
              </button>
            )}
          </div>

          {/* Hero Content */}
          <div className="text-center text-white max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight animate-fade-in-up">
              Plan Your Week of
              <span className="block text-yellow-300 animate-float delay-200">Delicious Dining</span>
            </h1>
            <p className="text-xl md:text-2xl mb-4 opacity-90 animate-fade-in-up delay-100">
              Your AI-powered meal planning assistant
            </p>
            <p className="text-lg mb-10 opacity-75 max-w-2xl mx-auto animate-fade-in-up delay-200">
              Tell us what you're craving, set your budget, and let our AI curate the perfect restaurants for your week.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up delay-300">
              <button 
                onClick={onStart} 
                className="bg-white text-orange-600 px-8 py-4 rounded-full text-lg font-bold 
                           hover:bg-orange-50 transition-all shadow-xl hover:shadow-2xl 
                           hover-lift flex items-center gap-2 group"
              >
                <span>Start Planning</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <p className="text-white/70 text-sm">Free • No signup required</p>
            </div>
          </div>

          {/* App Preview */}
          <div className="mt-16 relative animate-fade-in-up delay-400">
            <div className="glass-dark rounded-2xl p-4 max-w-4xl mx-auto">
              <div className="bg-gray-900/90 rounded-xl p-4 shadow-2xl backdrop-blur-sm">
                <div className="flex gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse-soft"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse-soft delay-100"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse-soft delay-200"></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {/* Sidebar mock */}
                  <div className="glass-dark rounded-lg p-3">
                    <p className="text-white text-xs font-medium mb-2">Your Week</p>
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, i) => (
                      <div key={day} className="flex items-center gap-2 py-1.5 animate-fade-in-left" style={{ animationDelay: `${i * 100}ms` }}>
                        <span className="text-gray-400 text-xs w-8">{day}</span>
                        <div className={`flex-1 h-6 rounded ${i < 3 ? 'bg-gradient-to-r from-orange-500/50 to-rose-500/50' : 'bg-gray-700/50'}`}></div>
                      </div>
                    ))}
                  </div>
                  {/* Chat mock */}
                  <div className="col-span-2 glass-dark rounded-lg p-3">
                    <div className="space-y-2">
                      <div className="bg-gray-700/50 rounded-lg p-2 max-w-[80%] animate-fade-in-right flex items-start gap-2">
                        <Bot className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                        <p className="text-white text-xs">I found 5 great Italian restaurants...</p>
                      </div>
                      <div className="bg-gradient-to-r from-orange-500 to-rose-500 rounded-lg p-2 max-w-[60%] ml-auto animate-fade-in-left delay-100">
                        <p className="text-white text-xs">Show me something spicy!</p>
                      </div>
                      <div className="bg-gray-700/50 rounded-lg p-2 max-w-[80%] animate-fade-in-right delay-200 flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                        <p className="text-white text-xs">Here are some hot picks...</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white/95 backdrop-blur-sm py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-4 animate-fade-in">
            Why <span className="gradient-text">DineAhead</span>?
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Stop wasting time deciding where to eat. Let AI plan your entire week.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div 
                key={i} 
                className="glass text-center p-6 rounded-2xl hover:bg-orange-50/50 hover:shadow-xl 
                           transition-all group hover-lift animate-fade-in-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-100 to-rose-100 
                                flex items-center justify-center group-hover:scale-110 transition-transform">
                  <feature.icon className="w-8 h-8 text-orange-500" />
                </div>
                <h3 className="font-bold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="glass py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            How It Works
          </h2>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center gap-4 animate-fade-in-up" style={{ animationDelay: `${i * 150}ms` }}>
                <div className="flex items-center gap-3 glass rounded-full px-4 py-2 hover-lift transition-all">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 
                                  text-white font-bold flex items-center justify-center text-sm shadow-md">
                    {step.num}
                  </div>
                  <p className="text-gray-700 font-medium text-sm">{step.text}</p>
                </div>
                {i < steps.length - 1 && (
                  <ArrowRight className="hidden md:block w-6 h-6 text-orange-300 animate-pulse-soft" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Powered By */}
      <div className="bg-white/95 backdrop-blur-sm py-12">
        <div className="max-w-6xl mx-auto px-6 text-center animate-fade-in">
          <p className="text-gray-400 text-sm mb-3">Powered by</p>
          <div className="flex items-center justify-center gap-2">
            <span className="text-3xl font-bold text-red-600">yelp</span>
            <span className="glass px-2 py-1 rounded-full text-xs text-gray-500">AI API</span>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-gradient-to-r from-orange-500 via-rose-500 to-purple-500 py-16 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-float delay-300"></div>
        </div>
        <div className="max-w-6xl mx-auto px-6 text-center relative">
          <h2 className="text-3xl font-bold text-white mb-4 animate-fade-in-up">
            Ready to plan your perfect week?
          </h2>
          <p className="text-white/80 mb-8 animate-fade-in-up delay-100">
            Join food lovers who never stress about dinner again.
          </p>
          <button 
            onClick={onStart}
            className="bg-white text-orange-600 px-10 py-4 rounded-full text-lg font-bold 
                       hover:bg-orange-50 transition-all shadow-xl hover:shadow-2xl 
                       hover-lift animate-fade-in-up delay-200 inline-flex items-center gap-2"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-6 h-6 text-white" />
              <span className="text-white font-bold">DineAhead</span>
            </div>
            <p className="text-gray-500 text-sm">
              Built for the Yelp AI API Hackathon 2024
            </p>
            <p className="text-gray-500 text-sm">
              Made with ❤️ by Yash
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}