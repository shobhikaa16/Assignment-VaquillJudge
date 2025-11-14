import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Scale, Send, Gavel, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ✅ Correct Gemini AI API call (via Google Generative Language API)
// ✅ Secure version — calls your backend instead of Gemini directly
async function getGeminiJudgeResponse(messages: { role: string; content: string }[]) {
  const prompt = messages
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n\n");

  try {
    const response = await fetch("http://localhost:8787/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        caseTitle: "AI Courtroom",
        description: prompt,
        plaintiffDocs: "No documents provided",   // <-- ADD THIS
        defendantDocs: "No documents provided",   // <-- ADD THIS
        text: prompt,
      }),
    });

    if (!response.ok) throw new Error(`Backend error: ${response.statusText}`);

    const data = await response.json();
    return data?.result || "The Judge is unable to provide a response.";
;
  } catch (err) {
    console.error("AI Judge backend error:", err);
    throw err;
  }
}


type Message = {
  role: "plaintiff" | "defendant" | "judge";
  content: string;
  timestamp: Date;
};

const Courtroom = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const caseData = location.state || {};

  const [messages, setMessages] = useState<Message[]>([]);
  const [plaintiffInput, setPlaintiffInput] = useState("");
  const [defendantInput, setDefendantInput] = useState("");
  const [argumentsRemaining, setArgumentsRemaining] = useState(5);
  const [currentPhase, setCurrentPhase] = useState<"initial" | "arguments" | "final">("initial");
  const [judgeThinking, setJudgeThinking] = useState(false);

  useEffect(() => {
    if (!caseData.caseTitle) {
      navigate("/case-setup");
      return;
    }

    setTimeout(() => {
      const initialMessage: Message = {
        role: "judge",
        content: `Court is now in session for ${caseData.caseTitle}. Both parties may present their opening arguments. I will analyze the case details and render an initial verdict based on the evidence and legal precedents.`,
        timestamp: new Date(),
      };
      setMessages([initialMessage]);
    }, 1000);
  }, [caseData, navigate]);

  const handleSendMessage = async (side: "plaintiff" | "defendant", message: string) => {
    if (!message.trim() || argumentsRemaining <= 0) return;

    const newMessage: Message = {
      role: side,
      content: message,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);

    if (side === "plaintiff") setPlaintiffInput("");
    else setDefendantInput("");

    setJudgeThinking(true);
    const remaining = argumentsRemaining - 1;
    setArgumentsRemaining(remaining);

    const chatMessages = [
      { role: "system", content: "You are an AI Judge. Be unbiased, logical, and concise in your legal reasoning and verdicts." },
      ...messages.map((msg) => ({
        role: msg.role === "judge" ? "assistant" : "user",
        content: msg.content,
      })),
      { role: "user", content: message },
    ];

    try {
      const judgeReply = await getGeminiJudgeResponse(chatMessages);
      const judgeResponse: Message = {
        role: "judge",
        content:
          judgeReply +
          (remaining > 0
            ? ` You have ${remaining} argument${remaining !== 1 ? "s" : ""} remaining.`
            : " This concludes the argument phase. The final verdict will follow."),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, judgeResponse]);
    } catch (err) {
      console.error("AI judge error:", err);
      const fallback: Message = {
        role: "judge",
        content:
          remaining > 0
            ? `The court acknowledges this argument. It will be considered. ${remaining} argument${remaining !== 1 ? "s" : ""} remaining.`
            : "This concludes the argument phase. The court will now deliver the final verdict.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, fallback]);
    } finally {
      setJudgeThinking(false);
    }

    if (remaining === 0) {
      setJudgeThinking(true);
      setTimeout(async () => {
        try {
          const finalChatMessages = [
            { role: "system", content: "You are an AI Judge. After hearing all arguments, deliver a fair final verdict explaining your reasoning clearly." },
            ...messages.map((msg) => ({
              role: msg.role === "judge" ? "assistant" : "user",
              content: msg.content,
            })),
          ];

          const finalVerdictText = await getGeminiJudgeResponse(finalChatMessages);
          const finalVerdict: Message = {
            role: "judge",
            content: finalVerdictText || "The court deliberates but is unable to reach a final decision.",
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, finalVerdict]);
          setCurrentPhase("final");
        } catch (err) {
          console.error("Final verdict AI error:", err);
          const errorFallback: Message = {
            role: "judge",
            content: "After careful consideration, the court cannot deliver a final verdict at this moment.",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorFallback]);
          setCurrentPhase("final");
        } finally {
          setJudgeThinking(false);
        }
      }, 1500);
    }
  };

  const handleInitialVerdict = async () => {
    setJudgeThinking(true);

    const chatMessages = [
      { role: "system", content: "You are an AI Judge. Provide a clear initial verdict and reasoning based on the available facts." },
      ...messages.map((msg) => ({
        role: msg.role === "judge" ? "assistant" : "user",
        content: msg.content,
      })),
    ];

    try {
      const reply = await getGeminiJudgeResponse(chatMessages);
      const verdict: Message = {
        role: "judge",
        content: reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, verdict]);
      setCurrentPhase("arguments");
    } catch (err) {
      console.error("AI initial verdict error:", err);
      const fallback: Message = {
        role: "judge",
        content: `Court is now open for arguments. You have ${argumentsRemaining} opportunities to present your case.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, fallback]);
      setCurrentPhase("arguments");
    } finally {
      setJudgeThinking(false);
    }
  };

  const getMessageAlignment = (role: Message["role"]) => {
    if (role === "judge") return "mx-auto max-w-2xl";
    if (role === "plaintiff") return "mr-auto";
    return "ml-auto";
  };

  const getMessageStyle = (role: Message["role"]) => {
    if (role === "judge") return "bg-primary text-primary-foreground border-secondary";
    if (role === "plaintiff") return "bg-card border-l-4 border-l-plaintiff";
    return "bg-card border-l-4 border-l-defendant";
  };

  return (
    <div className="min-h-screen bg-courtroom-bg flex flex-col">
      <header className="border-b border-border bg-card sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Scale className="h-6 w-6 text-secondary" />
              <div>
                <h1 className="text-xl font-bold text-primary">{caseData.caseTitle}</h1>
                <p className="text-sm text-muted-foreground">
                  {caseData.plaintiffName} v. {caseData.defendantName}
                </p>
              </div>
            </div>
            {currentPhase === "arguments" && (
              <div className="flex items-center gap-2 px-4 py-2 bg-secondary/10 rounded-lg">
                <AlertCircle className="h-4 w-4 text-secondary" />
                <span className="text-sm font-medium">
                  {argumentsRemaining} argument{argumentsRemaining !== 1 ? "s" : ""} remaining
                </span>
              </div>
            )}
            <Button variant="outline" onClick={() => navigate("/case-setup")}>
              New Case
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 flex gap-4">
        {/* Plaintiff Side */}
        <div className="w-1/4 space-y-4">
          <Card className="p-4 border-l-4 border-l-plaintiff shadow">
            <h3 className="font-semibold text-primary mb-2">Side A - Plaintiff</h3>
            <p className="text-sm text-foreground font-medium mb-4">{caseData.plaintiffName}</p>
            {currentPhase === "arguments" && argumentsRemaining > 0 && (
              <div className="space-y-2">
                <Textarea
                  placeholder="Enter your argument..."
                  value={plaintiffInput}
                  onChange={(e) => setPlaintiffInput(e.target.value)}
                  rows={4}
                />
                <Button
                  onClick={() => handleSendMessage("plaintiff", plaintiffInput)}
                  disabled={!plaintiffInput.trim() || judgeThinking}
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" /> Submit Argument
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Center - Judge */}
        <div className="flex-1 flex flex-col">
          <Card className="mb-6 p-6 bg-gradient-to-b from-primary to-primary/80 text-primary-foreground">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-3 shadow-lg">
                <Gavel className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-1">AI Judge</h2>
              <p className="text-sm opacity-90">{judgeThinking ? "Deliberating..." : "Presiding"}</p>
            </div>
          </Card>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 pb-4">
            {messages.map((msg, idx) => (
              <Card key={idx} className={`p-4 ${getMessageAlignment(msg.role)} ${getMessageStyle(msg.role)}`}>
                <p className="text-sm font-semibold mb-1 capitalize">
                  {msg.role === "plaintiff"
                    ? caseData.plaintiffName
                    : msg.role === "defendant"
                    ? caseData.defendantName
                    : "Judge"}
                </p>
                <p className="text-sm leading-relaxed">{msg.content}</p>
              </Card>
            ))}

            {judgeThinking && (
              <Card className="p-4 mx-auto max-w-2xl bg-primary/5 border-secondary/30">
                <p className="text-sm text-muted-foreground text-center">Judge is deliberating...</p>
              </Card>
            )}
          </div>

          {currentPhase === "initial" && messages.length > 0 && (
            <Button
              onClick={handleInitialVerdict}
              disabled={judgeThinking}
              className="mt-4 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold"
            >
              <Gavel className="h-5 w-5 mr-2" /> Request Initial Verdict
            </Button>
          )}
        </div>

        {/* Defendant Side */}
        <div className="w-1/4 space-y-4">
          <Card className="p-4 border-l-4 border-l-defendant shadow">
            <h3 className="font-semibold text-primary mb-2">Side B - Defendant</h3>
            <p className="text-sm text-foreground font-medium mb-4">{caseData.defendantName}</p>
            {currentPhase === "arguments" && argumentsRemaining > 0 && (
              <div className="space-y-2">
                <Textarea
                  placeholder="Enter your argument..."
                  value={defendantInput}
                  onChange={(e) => setDefendantInput(e.target.value)}
                  rows={4}
                />
                <Button
                  onClick={() => handleSendMessage("defendant", defendantInput)}
                  disabled={!defendantInput.trim() || judgeThinking}
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" /> Submit Argument
                </Button>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Courtroom;
