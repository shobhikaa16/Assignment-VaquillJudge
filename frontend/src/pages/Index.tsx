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
  <div className="min-h-screen bg-[#05060A] text-blue-200">
    {/* Header */}
    <header className="border-b border-blue-800/40 bg-[#0A0B10]/80 backdrop-blur-md shadow-lg shadow-blue-900/30">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scale className="h-6 w-6 text-blue-400 drop-shadow-[0_0_6px_#3b82f6]" />
          <span className="text-xl font-bold text-blue-300 drop-shadow-[0_0_8px_#3b82f6]">
            AI Judge
          </span>
        </div>
        <Button
          onClick={() => navigate("/case-setup")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-[0_0_12px_#3b82f6]"
        >
          Start New Case
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </header>

    {/* Hero Section */}
    <section className="relative py-20 px-4 overflow-hidden bg-[#07080D]">
      <div className="absolute inset-0 bg-blue-500/10 blur-3xl opacity-20"></div>

      <div className="container mx-auto max-w-5xl text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-700/40 rounded-full mb-6 backdrop-blur-sm">
          <Zap className="h-4 w-4 text-blue-400 drop-shadow-[0_0_6px_#3b82f6]" />
          <span className="text-sm font-medium text-blue-300">
            AI-Powered Legal Simulation
          </span>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-blue-200 mb-6 leading-tight drop-shadow-[0_0_12px_#3b82f6]">
          Experience Justice
          <span className="block text-blue-400 drop-shadow-[0_0_15px_#3b82f6]">
            Before the Courtroom
          </span>
        </h1>

        <p className="text-xl text-blue-300/80 mb-8 max-w-3xl mx-auto leading-relaxed">
          Test your legal strategies with an AI judge trained on thousands of real
          court cases. Present evidence, argue your case, and receive realistic
          verdicts before stepping into the real courtroom.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate("/case-setup")}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 
            shadow-[0_0_15px_#3b82f6]"
          >
            Create Mock Trial
            <Scale className="ml-2 h-5 w-5" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="font-semibold border-blue-600 text-blue-400 hover:bg-blue-600/20"
          >
            Watch Demo
          </Button>
        </div>
      </div>
    </section>

    {/* How It Works */}
    <section className="py-16 px-4 bg-[#0A0B12]">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-300 mb-4 drop-shadow-[0_0_8px_#3b82f6]">
            How It Works
          </h2>
          <p className="text-lg text-blue-300/70">
            Simple, transparent, and designed for legal professionals
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-[#0F111A] border border-blue-700/40 shadow-[0_0_12px_#3b82f6]">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4 border border-blue-700/40">
                <FileText className="h-6 w-6 text-blue-400" />
              </div>
              <CardTitle className="text-blue-300">1. Submit Evidence</CardTitle>
              <CardDescription className="text-blue-300/70">
                Both parties upload documents, case details, and supporting evidence.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-[#0F111A] border border-blue-700/40 shadow-[0_0_12px_#3b82f6]">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4 border border-blue-700/40">
                <Gavel className="h-6 w-6 text-blue-400" />
              </div>
              <CardTitle className="text-blue-300">2. Initial Verdict</CardTitle>
              <CardDescription className="text-blue-300/70">
                The AI analyzes evidence and prior cases to render a fair verdict.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-[#0F111A] border border-blue-700/40 shadow-[0_0_12px_#3b82f6]">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4 border border-blue-700/40">
                <MessageSquare className="h-6 w-6 text-blue-400" />
              </div>
              <CardTitle className="text-blue-300">3. Challenge & Argue</CardTitle>
              <CardDescription className="text-blue-300/70">
                Present counter-arguments, challenge the verdict, and get reevaluations.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </section>

    {/* Features Grid */}
    <section className="py-16 px-4 bg-[#07080D]">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-blue-300 mb-4 drop-shadow-[0_0_10px_#3b82f6]">
            Powerful Features
          </h2>
          <p className="text-lg text-blue-300/70">
            Everything you need for a realistic legal simulation
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <Card
                key={idx}
                className="bg-[#0F111A] border border-blue-700/40 shadow-[0_0_20px_#3b82f6] hover:shadow-[0_0_35px_#3b82f6] transition-shadow"
              >
                <CardHeader>
                  <Icon className="h-8 w-8 text-blue-400 mb-3 drop-shadow-[0_0_8px_#3b82f6]" />
                  <CardTitle className="text-lg text-blue-300">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-blue-300/70">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>

    {/* CTA Section */}
    <section className="py-20 px-4 bg-blue-600/20 text-blue-100">
      <div className="container mx-auto max-w-4xl text-center">
        <Scale className="h-16 w-16 mx-auto mb-6 text-blue-400 drop-shadow-[0_0_15px_#3b82f6]" />
        <h2 className="text-4xl font-bold mb-4 text-blue-200 drop-shadow-[0_0_12px_#3b82f6]">
          Ready to Test Your Case?
        </h2>
        <p className="text-xl mb-8 text-blue-300/80">
          Join legal professionals using AI Judge to prepare better and argue smarter.
        </p>
        <Button
          onClick={() => navigate("/case-setup")}
          size="lg"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 shadow-[0_0_25px_#3b82f6]"
        >
          Start Your First Case
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </section>

    {/* Footer */}
    <footer className="border-t border-blue-800/40 py-8 px-4 bg-[#0A0B12]">
      <div className="container mx-auto text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Scale className="h-5 w-5 text-blue-400 drop-shadow-[0_0_6px_#3b82f6]" />
          <span className="font-bold text-blue-300">AI Judge</span>
        </div>
        <p className="text-sm text-blue-300/70">
          AI-powered legal simulation platform • Not a substitute for real legal advice
        </p>
      </div>
    </footer>
  </div>
);

};

export default Index;
