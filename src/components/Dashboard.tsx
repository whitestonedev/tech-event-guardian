import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut, RefreshCw, Globe, Code } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { apiService } from "../services/api";
import { Event } from "../types";
import EventCard from "./EventCard";
import EventReviewModal from "./EventReviewModal";
import EventFilters from "./EventFilters";
import { toast } from "@/hooks/use-toast";

const Dashboard: React.FC = () => {
  const { logout, token } = useAuth();
  const [pendingEvents, setPendingEvents] = useState<Event[]>([]);
  const [approvedEvents, setApprovedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Filter states
  const [pendingSearchTerm, setPendingSearchTerm] = useState("");
  const [approvedSearchTerm, setApprovedSearchTerm] = useState("");
  const [pendingSelectedTags, setPendingSelectedTags] = useState<string[]>([]);
  const [approvedSelectedTags, setApprovedSelectedTags] = useState<string[]>(
    []
  );

  useEffect(() => {
    if (token) {
      apiService.setToken(token);
      loadEvents();
    }
  }, [token]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const [pending, approved] = await Promise.all([
        apiService.getPendingEvents(),
        apiService.getApprovedEvents(),
      ]);
      setPendingEvents(pending);
      setApprovedEvents(approved);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar eventos. Verifique sua conexão.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReviewEvent = (event: Event) => {
    console.log("handleReviewEvent chamado com evento:", event);
    setSelectedEvent(event);
    setIsReviewModalOpen(true);
    console.log("Estado do modal atualizado:", {
      selectedEvent: event,
      isOpen: true,
    });
  };

  const handleApproveEvent = async (
    eventId: number,
    updatedEvent?: Partial<Event>
  ) => {
    try {
      // Primeiro aprova o evento
      await apiService.approveEvent(eventId, "approved");

      // Só atualiza o evento se houver alterações
      if (updatedEvent && Object.keys(updatedEvent).length > 0) {
        console.log("Atualizando dados do evento:", updatedEvent);
        await apiService.updateEvent(eventId, updatedEvent);
      }

      await loadEvents();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao aprovar evento.",
        variant: "destructive",
      });
    }
  };

  const handleDeclineEvent = async (eventId: number) => {
    try {
      await apiService.approveEvent(eventId, "declined");
      await loadEvents();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao recusar evento.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    try {
      await apiService.deleteEvent(eventId);
      await loadEvents();
      toast({
        title: "Sucesso",
        description: "Evento excluído com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir evento.",
        variant: "destructive",
      });
    }
  };

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsReviewModalOpen(true);
  };

  const getAllTags = (events: Event[]) => {
    const tags = new Set<string>();
    events.forEach((event) => {
      event.tags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags);
  };

  const filterEvents = (
    events: Event[],
    searchTerm: string,
    selectedTags: string[]
  ) => {
    return events.filter((event) => {
      const matchesSearch =
        event.event_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.organization_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.some((tag) => event.tags.includes(tag));
      return matchesSearch && matchesTags;
    });
  };

  const filteredPendingEvents = filterEvents(
    pendingEvents,
    pendingSearchTerm,
    pendingSelectedTags
  );
  const filteredApprovedEvents = filterEvents(
    approvedEvents,
    approvedSearchTerm,
    approvedSelectedTags
  );

  return (
    <div className="min-h-screen bg-background noise-bg">
      <header className="border-b border-border glassmorphism">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4 md:gap-0">
          <div className="flex justify-center md:justify-start">
            <img
              src="/img/logotipo_white.png"
              alt="Tech Event Guardian"
              className="h-16"
            />
          </div>
          <div className="flex flex-wrap justify-center md:justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                window.open("https://www.calendario.tech/", "_blank")
              }
            >
              <Globe className="w-4 h-4 mr-2" />
              Site
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                window.open(
                  "https://api.calendario.tech/openapi/scalar",
                  "_blank"
                )
              }
            >
              <Code className="w-4 h-4 mr-2" />
              API
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={loadEvents}
              disabled={loading}
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              Atualizar
            </Button>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-muted">
            <TabsTrigger
              value="pending"
              className="data-[state=active]:bg-tech-purple data-[state=active]:text-primary-foreground"
            >
              Eventos Pendentes ({pendingEvents.length})
            </TabsTrigger>
            <TabsTrigger
              value="approved"
              className="data-[state=active]:bg-tech-purple data-[state=active]:text-primary-foreground"
            >
              Eventos Aprovados ({approvedEvents.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-6">
            <EventFilters
              searchTerm={pendingSearchTerm}
              onSearchChange={setPendingSearchTerm}
              statusFilter="pending"
              onStatusFilterChange={() => {}}
              selectedTags={pendingSelectedTags}
              onTagToggle={(tag) => {
                setPendingSelectedTags((prev) =>
                  prev.includes(tag)
                    ? prev.filter((t) => t !== tag)
                    : [...prev, tag]
                );
              }}
              availableTags={getAllTags(pendingEvents)}
              showStatusFilter={false}
            />

            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
                <p>Carregando eventos...</p>
              </div>
            ) : filteredPendingEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhum evento pendente encontrado.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPendingEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onReview={handleReviewEvent}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-6">
            <EventFilters
              searchTerm={approvedSearchTerm}
              onSearchChange={setApprovedSearchTerm}
              statusFilter="approved"
              onStatusFilterChange={() => {}}
              selectedTags={approvedSelectedTags}
              onTagToggle={(tag) => {
                setApprovedSelectedTags((prev) =>
                  prev.includes(tag)
                    ? prev.filter((t) => t !== tag)
                    : [...prev, tag]
                );
              }}
              availableTags={getAllTags(approvedEvents)}
              showStatusFilter={false}
            />

            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
                <p>Carregando eventos...</p>
              </div>
            ) : filteredApprovedEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhum evento aprovado encontrado.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredApprovedEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onEdit={handleEditEvent}
                    onDelete={handleDeleteEvent}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <EventReviewModal
        event={selectedEvent}
        isOpen={isReviewModalOpen}
        onClose={() => {
          console.log("Modal fechando");
          setIsReviewModalOpen(false);
          setSelectedEvent(null);
        }}
        onApprove={handleApproveEvent}
        onDecline={handleDeclineEvent}
      />
    </div>
  );
};

export default Dashboard;
