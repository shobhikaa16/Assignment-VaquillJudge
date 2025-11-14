import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale, FileText, MessageSquare, Gavel, ArrowRight, Shield, Globe, Zap } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: FileText,
      title: "Document Analysis",
      description: "Upload legal documents, case files, and evidence in multiple formats (PDF, Word, text).",
    },
    {
      icon: Gavel,
      title: "AI-Powered Verdict",
      description: "Trained on thousands of judgments to provide realistic mock trial outcomes based on legal precedents.",
    },
    {
      icon: MessageSquare,
      title: "Interactive Arguments",
      description: "Challenge the initial verdict with up to 5 counter-arguments and cross-examinations.",
    },
    {
      icon: Scale,
      title: "Fair Deliberation",
      description: "Both parties receive equal opportunity to present their case and supporting arguments.",
    },
    {
      icon: Shield,
      title: "Legal Accuracy",
      description: "Decisions based on actual legal frameworks and precedents from multiple jurisdictions.",
    },
    {
      icon: Globe,
      title: "International Cases",
      description: "Support for cases from various countries with region-specific legal knowledge.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="h-6 w-6 text-secondary" />
            <span className="text-xl font-bold text-primary">AI Judge</span>
          </div>
          <Button
            onClick={() => navigate("/case-setup")}
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold"
          >
            Start New Case
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[var(--gradient-hero)] opacity-5"></div>
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 rounded-full mb-6">
            <Zap className="h-4 w-4 text-secondary" />
            <span className="text-sm font-medium text-secondary">AI-Powered Legal Simulation</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-primary mb-6 leading-tight">
            Experience Justice
            <span className="block text-secondary">Before the Courtroom</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Test your legal strategies with an AI judge trained on thousands of real court cases. 
            Present evidence, argue your case, and receive realistic verdicts before stepping into the real courtroom.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate("/case-setup")}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 shadow-[var(--shadow-elegant)]"
            >
              Create Mock Trial
              <Scale className="ml-2 h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="font-semibold"
            >
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-courtroom-bg">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground">
              Simple, transparent, and designed for legal professionals
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="shadow-[var(--shadow-card)] border-t-4 border-t-plaintiff">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-plaintiff/10 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-plaintiff" />
                </div>
                <CardTitle>1. Submit Evidence</CardTitle>
                <CardDescription>
                  Both parties upload documents, case details, and supporting evidence for their respective sides.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-[var(--shadow-card)] border-t-4 border-t-secondary">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                  <Gavel className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle>2. Initial Verdict</CardTitle>
                <CardDescription>
                  The AI Judge analyzes all evidence and legal precedents to render an initial verdict based on the law.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="shadow-[var(--shadow-card)] border-t-4 border-t-defendant">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-defendant/10 flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-defendant" />
                </div>
                <CardTitle>3. Challenge & Argue</CardTitle>
                <CardDescription>
                  Present counter-arguments and challenge the verdict. The AI reconsibers with up to 5 follow-up rounds.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Powerful Features</h2>
            <p className="text-lg text-muted-foreground">
              Everything you need for a realistic legal simulation
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Card key={idx} className="shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elegant)] transition-shadow">
                  <CardHeader>
                    <Icon className="h-8 w-8 text-secondary mb-3" />
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-[var(--gradient-hero)] text-primary-foreground">
        <div className="container mx-auto max-w-4xl text-center">
          <Scale className="h-16 w-16 mx-auto mb-6 text-secondary" />
          <h2 className="text-4xl font-bold mb-4">Ready to Test Your Case?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join legal professionals using AI Judge to prepare for real courtroom battles.
          </p>
          <Button
            onClick={() => navigate("/case-setup")}
            size="lg"
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold px-8"
          >
            Start Your First Case
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4 bg-card">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Scale className="h-5 w-5 text-secondary" />
            <span className="font-bold text-primary">AI Judge</span>
          </div>
          <p className="text-sm text-muted-foreground">
            AI-powered legal simulation platform • Not a substitute for real legal advice
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
