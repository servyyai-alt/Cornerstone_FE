"use client";

import { useState } from 'react';
import { Sliders, HelpCircle, ChevronRight } from 'lucide-react';

const AdmissionsFees = () => {
  const [destination, setDestination] = useState('United Kingdom');
  const [yearsInIndia, setYearsInIndia] = useState(2);
  const [subject, setSubject] = useState('Computing & Data');

  const costModels = {
    'United Kingdom': { overseasCost: 35.0, name: 'UK' },
    'Australia': { overseasCost: 38.0, name: 'Australia' },
    'Canada': { overseasCost: 36.0, name: 'Canada' },
    'Ireland': { overseasCost: 32.0, name: 'Ireland' }
  };

  const costIndiaPerYear = 4.5;
  const currentModel = costModels[destination];

  const totalYears = 3;
  const yearsOverseas = totalYears - yearsInIndia;

  const directTotal = currentModel.overseasCost * totalYears;
  const pathwayTotal = (costIndiaPerYear * yearsInIndia) + (currentModel.overseasCost * yearsOverseas);
  const savings = directTotal - pathwayTotal;

  const calculateEMI = (principalLakhs) => {
    const principal = principalLakhs * 100000;
    const rate = 9.5 / 12 / 100;
    const months = 120;
    const emi = (principal * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
    return Math.round(emi);
  };

  return (
    <main className="flex-1 bg-background text-foreground pb-24">
      <section className="container-prose pt-16 pb-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Cost Calculator</p>
        <h1 className="mt-4 font-display text-4xl sm:text-5xl lg:text-6xl max-w-3xl leading-[1.05]">
          The same degree, staged differently.
        </h1>
        <p className="mt-4 text-muted-foreground max-w-2xl text-lg">
          Staged cost estimates based on destination country and years of study in India. Compare pathway savings with direct admissions.
        </p>
      </section>

      <section className="container-prose">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7 rounded-xl border border-border bg-surface p-6 shadow-sm space-y-6">
            <h2 className="font-display text-xl border-b border-border pb-3 flex items-center gap-2">
              <Sliders className="h-5 w-5 text-primary" />
              Adjust Assumptions
            </h2>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Destination Country</label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {Object.keys(costModels).map(country => (
                  <button
                    key={country}
                    onClick={() => setDestination(country)}
                    className={`py-2 px-3 text-xs font-semibold rounded-md border text-center transition-all duration-200 ${destination === country ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-background hover:bg-surface-2 hover:border-primary/30'}`}
                  >
                    {country}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Staging Split</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setYearsInIndia(1)}
                  className={`p-4 text-left rounded-lg border transition-all duration-200 ${yearsInIndia === 1 ? 'border-primary bg-primary/5 shadow-[0_4px_12px_-4px_rgba(232,181,67,0.12)]' : 'border-border bg-background hover:bg-surface-2 hover:border-primary/30'}`}
                >
                  <h4 className={`text-sm font-bold ${yearsInIndia === 1 ? 'text-primary' : ''}`}>1 Year India · 2 Years Abroad</h4>
                  <p className="text-xs text-muted-foreground mt-1">Lower local prep, faster overseas transfer.</p>
                </button>
                <button
                  onClick={() => setYearsInIndia(2)}
                  className={`p-4 text-left rounded-lg border transition-all duration-200 ${yearsInIndia === 2 ? 'border-primary bg-primary/5 shadow-[0_4px_12px_-4px_rgba(232,181,67,0.12)]' : 'border-border bg-background hover:bg-surface-2 hover:border-primary/30'}`}
                >
                  <h4 className={`text-sm font-bold ${yearsInIndia === 2 ? 'text-primary' : ''}`}>2 Years India · 1 Year Abroad</h4>
                  <p className="text-xs text-muted-foreground mt-1">Maximum local savings, mature transfer readiness.</p>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Subject Track</label>
              <div className="grid grid-cols-3 gap-2 text-center">
                {['Computing & Data', 'Business & Management', 'Engineering'].map(sub => (
                  <button
                    key={sub}
                    onClick={() => setSubject(sub)}
                    className={`py-2 px-3 text-xs font-semibold rounded-md border transition-all duration-200 ${subject === sub ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-background hover:bg-surface-2 hover:border-primary/30'}`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-surface-2 rounded-lg border border-border text-xs text-muted-foreground flex gap-2.5">
              <HelpCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              <p>
                Assumes ₹4.5 Lakhs per year in India (inclusive of local tuition and average accommodation). Overseas cost assumes median tuition fee and standard cost of living in secondary city zones.
              </p>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="rounded-xl border border-border bg-surface p-6 shadow-sm flex-1 flex flex-col justify-between space-y-6 transition-all duration-300 hover:border-primary/30 hover:shadow-[0_16px_32px_-10px_rgba(232,181,67,0.08)]">
              <div>
                <h3 className="font-display text-xl border-b border-border pb-3 mb-6">Financial Comparison</h3>

                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-semibold">Direct Overseas</p>
                      <p className="text-xs text-muted-foreground">3 years entirely overseas</p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">₹{directTotal.toFixed(0)} Lakh</p>
                  </div>

                  <div className="flex justify-between items-center border-t border-border/60 pt-4">
                    <div>
                      <p className="text-xs text-primary uppercase font-semibold">Cornerstone Pathway</p>
                      <p className="text-xs text-muted-foreground">{yearsInIndia} yr India · {yearsOverseas} yr {currentModel.name}</p>
                    </div>
                    <p className="text-2xl font-bold text-primary">₹{pathwayTotal.toFixed(0)} Lakh</p>
                  </div>
                </div>
              </div>

              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-center mt-6">
                <p className="text-xs text-primary uppercase font-semibold tracking-wider">Estimated Savings</p>
                <p className="text-3xl font-display text-primary font-bold mt-1">₹{savings.toFixed(0)} Lakh Lower</p>
                <p className="text-[10px] text-muted-foreground mt-1">Savings of ~{(savings / directTotal * 100).toFixed(0)}% on total degree costs</p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-surface p-6 shadow-sm space-y-4 transition-all duration-300 hover:border-primary/30 hover:shadow-[0_16px_32px_-10px_rgba(232,181,67,0.08)]">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">EMI Financing Options</h4>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-semibold">Indicative Monthly EMI</p>
                  <p className="text-xs text-muted-foreground">Estimated 10-year education loan</p>
                </div>
                <p className="text-xl font-bold text-foreground">₹{calculateEMI(pathwayTotal).toLocaleString('en-IN')}/mo</p>
              </div>
              <div className="border-t border-border/60 pt-3 text-[10px] text-muted-foreground">
                *Subject to banker evaluation and interest rates. Computed at 9.5% p.a. over a 120-month duration.
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AdmissionsFees;