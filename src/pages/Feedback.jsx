import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { cn } from "../lib/utils";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Star, CheckCircle2, Loader2, PartyPopper } from "lucide-react";
import { toast } from "sonner";

export default function FeedbackPage() {
  const { id } = useParams();
  const [score, setScore] = useState(0);
  const [hoveredScore, setHoveredScore] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [eventData, setEventData] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchEvent() {
      if (!id) return;

      const { data, error } = await supabase
        .from("events")
        .select("companyName, contactName, feedback")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching event:", error);
        setError(
          "Lo sentimos, no pudimos encontrar la información del evento."
        );
      } else {
        setEventData(data);
        // Si ya tiene feedback, podríamos mostrar un mensaje de "ya enviado"
        if (data.feedback) {
          setIsSubmitted(true);
        }
      }
    }
    fetchEvent();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (score === 0) {
      toast.error("Por favor selecciona una calificación");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error: rpcError } = await supabase.rpc(
        "submit_event_feedback",
        {
          p_event_id: id,
          p_score: score,
          p_feedback: feedback,
        }
      );

      if (rpcError) throw rpcError;

      if (data?.success) {
        setIsSubmitted(true);
        toast.success("¡Gracias por tu feedback!");
      } else {
        throw new Error(data?.message || "Error desconocido");
      }
    } catch (err) {
      console.error("Error submitting feedback:", err);
      toast.error(
        "Hubo un error al enviar tu calificación. Inténtalo de nuevo."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <Card className="w-full max-w-md text-center py-8">
          <CardHeader>
            <CardTitle className="text-red-600">Ocurrió un error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/")}
            >
              Volver al Inicio
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <Card className="w-full max-w-md text-center py-12 animate-in fade-in zoom-in duration-500">
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <div className="bg-green-100 p-4 rounded-full">
                <PartyPopper className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">
                ¡Muchas Gracias!
              </h2>
              <p className="text-muted-foreground text-lg">
                Tu opinión es muy importante para nosotros. Nos ayuda a seguir
                mejorando para tus próximos eventos.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
            <span className="text-sm font-medium text-green-600">
              Feedback enviado correctamente
            </span>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-indigo-50 via-white to-orange-50">
      <div className="mb-8 text-center space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl text-slate-900">
          Tu Opinión Cuenta
        </h1>
        <p className="max-w-[600px] text-slate-500 md:text-xl font-medium">
          Danos tu feedback sobre el evento de{" "}
          <span className="text-indigo-600 font-bold">
            {eventData?.companyName || "tu grupo"}
          </span>
        </p>
      </div>

      <Card className="w-full max-w-md shadow-2xl border-none backdrop-blur-sm bg-white/90">
        <form onSubmit={handleSubmit}>
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold">
              ¿Cómo calificarías el servicio?
            </CardTitle>
            <CardDescription>Califica de 1 a 5 estrellas</CardDescription>
          </CardHeader>

          <CardContent className="space-y-8 pt-6">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="transition-all duration-200 transform hover:scale-125 hover:-rotate-6"
                  onMouseEnter={() => setHoveredScore(star)}
                  onMouseLeave={() => setHoveredScore(0)}
                  onClick={() => setScore(star)}
                >
                  <Star
                    className={cn(
                      "h-10 w-10 transition-colors",
                      (hoveredScore || score) >= star
                        ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]"
                        : "text-slate-300"
                    )}
                  />
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <Label htmlFor="feedback" className="text-base font-semibold">
                ¿Qué te gustó o qué podríamos mejorar?
              </Label>
              <Textarea
                id="feedback"
                placeholder="Escribe tus comentarios aquí..."
                className="min-h-[120px] resize-none focus:ring-2 focus:ring-indigo-500 border-slate-200"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </div>
          </CardContent>

          <CardFooter className="pt-2">
            <Button
              type="submit"
              className="w-full h-12 text-lg font-bold bg-indigo-600 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
              disabled={isLoading || score === 0}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar Calificación"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <footer className="mt-12 text-slate-400 text-sm">
        © {new Date().getFullYear()} Event Planner · Todos los derechos
        reservados
      </footer>
    </div>
  );
}
