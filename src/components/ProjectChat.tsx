import { useState, useRef, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { chatTurn } from "@/lib/chatbot.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2 } from "lucide-react";

export type ChatMessage = { role: "user" | "assistant"; content: string };

export function ProjectChat({
  modulo,
  initial,
  onChange,
}: {
  modulo: 1 | 3;
  initial: ChatMessage[];
  onChange: (msgs: ChatMessage[]) => void;
}) {
  const [msgs, setMsgs] = useState<ChatMessage[]>(initial);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const send = useServerFn(chatTurn);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);
  useEffect(() => { onChange(msgs); }, [msgs, onChange]);

  // Kick-off first assistant message
  useEffect(() => {
    if (msgs.length === 0) {
      setBusy(true);
      send({ data: { modulo, history: [], userText: "Hola, quiero empezar." } })
        .then((r) => setMsgs([{ role: "assistant", content: r.reply }]))
        .catch((e) => setMsgs([{ role: "assistant", content: "Error: " + (e as Error).message }]))
        .finally(() => setBusy(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSend = async () => {
    if (!input.trim() || busy) return;
    const userMsg: ChatMessage = { role: "user", content: input.trim() };
    const newMsgs = [...msgs, userMsg];
    setMsgs(newMsgs);
    setInput("");
    setBusy(true);
    try {
      const r = await send({ data: { modulo, history: newMsgs, userText: userMsg.content } });
      setMsgs([...newMsgs, { role: "assistant", content: r.reply }]);
    } catch (e) {
      setMsgs([...newMsgs, { role: "assistant", content: "Error: " + (e as Error).message }]);
    } finally { setBusy(false); }
  };

  return (
    <div className="border rounded-xl bg-card flex flex-col h-[500px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap ${
              m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
            }`}>{m.content}</div>
          </div>
        ))}
        {busy && <div className="flex items-center gap-2 text-muted-foreground text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Asistente escribiendo…</div>}
        <div ref={bottomRef} />
      </div>
      <div className="border-t p-3 flex gap-2">
        <Input value={input} onChange={(e)=>setInput(e.target.value)} onKeyDown={(e)=>e.key==="Enter"&&handleSend()} placeholder="Escribe tu respuesta…" disabled={busy} />
        <Button onClick={handleSend} disabled={busy || !input.trim()}><Send className="w-4 h-4" /></Button>
      </div>
    </div>
  );
}
