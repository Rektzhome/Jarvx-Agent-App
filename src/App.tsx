import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { MainNavbar } from './components/navbar';
import { HeroSection } from './components/hero-section';
import { FeaturesSection } from './components/features-section';
import { Testimonials } from './components/testimonials';
import { PricingSection } from './components/pricing-section';
import { Footer } from './components/footer';
import { GeneratorPage } from './pages/generator-page';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground">
        <MainNavbar />
        <Switch>
          <Route exact path="/">
            <main>
              <HeroSection />
              <FeaturesSection />
              <Testimonials />
              <PricingSection />
            </main>
          </Route>
          <Route path="/generator">
            <GeneratorPage />
          </Route>
        </Switch>
        <Footer />
      </div>
    </Router>
  );
}

export default App;