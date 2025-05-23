import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Event } from "../types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";

interface EventReviewModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (eventId: number, updatedEvent?: Partial<Event>) => void;
  onDecline: (eventId: number) => void;
}

type IntlField = "banner_link" | "cost" | "event_edition" | "short_description";

const EventReviewModal: React.FC<EventReviewModalProps> = ({
  event,
  isOpen,
  onClose,
  onApprove,
  onDecline,
}) => {
  const [editedEvent, setEditedEvent] = useState<Event | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationType, setConfirmationType] = useState<
    "approve" | "decline" | null
  >(null);

  React.useEffect(() => {
    if (event) {
      setEditedEvent({ ...event });
    }
  }, [event, isOpen]);

  if (!event || !editedEvent) {
    return null;
  }

  const handleFieldChange = (field: keyof Event, value: string | boolean) => {
    setEditedEvent((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleIntlChange = (lang: string, field: IntlField, value: string) => {
    setEditedEvent((prev) =>
      prev
        ? {
            ...prev,
            intl: {
              ...prev.intl,
              [lang]: {
                ...prev.intl[lang],
                [field]: value,
              },
            },
          }
        : null
    );
  };

  const handleAddLanguage = (langCode: string) => {
    setEditedEvent((prev) =>
      prev
        ? {
            ...prev,
            intl: {
              ...prev.intl,
              [langCode]: {
                banner_link: "",
                cost: "",
                event_edition: "",
                short_description: "",
              },
            },
          }
        : null
    );
  };

  const handleRemoveLanguage = (langCode: string) => {
    setEditedEvent((prev) => {
      if (!prev) return null;
      const newIntl = { ...prev.intl };
      delete newIntl[langCode];
      return { ...prev, intl: newIntl };
    });
  };

  const handleApprove = () => {
    if (showConfirmation) {
      const hasChanges = Object.keys(editedEvent).some((key) => {
        if (key === "intl") {
          return (
            JSON.stringify(editedEvent.intl) !== JSON.stringify(event.intl)
          );
        }
        return editedEvent[key as keyof Event] !== event[key as keyof Event];
      });

      onApprove(event.id, hasChanges ? editedEvent : undefined);
      setShowConfirmation(false);
      setConfirmationType(null);
      onClose();
      toast({
        title: "Evento aprovado",
        description: "O evento foi aprovado com sucesso!",
      });
    } else {
      setShowConfirmation(true);
      setConfirmationType("approve");
    }
  };

  const handleDecline = () => {
    if (showConfirmation) {
      onDecline(event.id);
      setShowConfirmation(false);
      setConfirmationType(null);
      onClose();
      toast({
        title: "Evento recusado",
        description: "O evento foi recusado.",
        variant: "destructive",
      });
    } else {
      setShowConfirmation(true);
      setConfirmationType("decline");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-green-500">
            {event.status === "approved" ? "Editar Evento" : "Revisar Evento"}
          </DialogTitle>
        </DialogHeader>

        {showConfirmation ? (
          <div className="space-y-6 p-6 text-center">
            <h3 className="text-lg font-semibold">
              {confirmationType === "approve"
                ? event.status === "approved"
                  ? "Confirmar Alterações"
                  : "Confirmar Aprovação"
                : "Confirmar Recusa"}
            </h3>
            <p className="text-muted-foreground">
              {confirmationType === "approve"
                ? event.status === "approved"
                  ? "Tem certeza que deseja salvar as alterações realizadas neste evento?"
                  : "Tem certeza que deseja aprovar este evento com as alterações realizadas?"
                : "Tem certeza que deseja recusar este evento?"}
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                onClick={
                  confirmationType === "approve" ? handleApprove : handleDecline
                }
                className={
                  confirmationType === "approve"
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-red-500 hover:bg-red-600 text-white"
                }
              >
                {confirmationType === "approve"
                  ? event.status === "approved"
                    ? "Salvar Alterações"
                    : "Confirmar Aprovação"
                  : "Confirmar Recusa"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowConfirmation(false);
                  setConfirmationType(null);
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome do Evento</Label>
                <Input
                  value={editedEvent.event_name}
                  onChange={(e) =>
                    handleFieldChange("event_name", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Organização</Label>
                <Input
                  value={editedEvent.organization_name}
                  onChange={(e) =>
                    handleFieldChange("organization_name", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Data/Hora de Início</Label>
                <Input
                  type="datetime-local"
                  value={editedEvent.start_datetime.slice(0, 16)}
                  onChange={(e) =>
                    handleFieldChange("start_datetime", e.target.value + ":00")
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Data/Hora de Fim</Label>
                <Input
                  type="datetime-local"
                  value={editedEvent.end_datetime.slice(0, 16)}
                  onChange={(e) =>
                    handleFieldChange("end_datetime", e.target.value + ":00")
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Link do Evento</Label>
                <Input
                  value={editedEvent.event_link}
                  onChange={(e) =>
                    handleFieldChange("event_link", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Link do Maps</Label>
                <Input
                  value={editedEvent.maps_link}
                  onChange={(e) =>
                    handleFieldChange("maps_link", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2 flex items-center gap-2">
                <Switch
                  checked={editedEvent.online}
                  onCheckedChange={(checked) =>
                    handleFieldChange("online", checked)
                  }
                />
                <Label>Evento Online</Label>
              </div>
            </div>

            {!editedEvent.online && (
              <div className="space-y-2">
                <Label>Endereço</Label>
                <Textarea
                  value={editedEvent.address}
                  onChange={(e) => handleFieldChange("address", e.target.value)}
                />
              </div>
            )}

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold">Informações por Idioma</h4>
                <div className="flex gap-2">
                  <Input
                    placeholder="Código do idioma (ex: es-es)"
                    className="w-48"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const input = e.target as HTMLInputElement;
                        const langCode = input.value.trim().toLowerCase();
                        if (langCode && !editedEvent.intl[langCode]) {
                          handleAddLanguage(langCode);
                          input.value = "";
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {Object.entries(editedEvent.intl).map(([langCode, langData]) => (
                <div key={langCode} className="space-y-4 border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <h5 className="font-medium">
                      {langCode === "pt-br"
                        ? "Português"
                        : langCode === "en-us"
                        ? "Inglês"
                        : langCode.toUpperCase()}
                    </h5>
                    {langCode !== "pt-br" && langCode !== "en-us" && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveLanguage(langCode)}
                      >
                        Remover
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Link do Banner</Label>
                      <Input
                        value={langData.banner_link}
                        onChange={(e) =>
                          handleIntlChange(
                            langCode,
                            "banner_link",
                            e.target.value
                          )
                        }
                      />
                      {langData.banner_link && (
                        <div className="relative w-full h-32 mt-2 rounded-lg overflow-hidden border">
                          <img
                            src={langData.banner_link}
                            alt={`Banner ${langCode}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src =
                                "https://placehold.co/600x400/EFFAF1/8F8F8F?text=Imagem+não+encontrada";
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Custo</Label>
                      <Input
                        value={langData.cost}
                        onChange={(e) =>
                          handleIntlChange(langCode, "cost", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Edição</Label>
                      <Input
                        value={langData.event_edition}
                        onChange={(e) =>
                          handleIntlChange(
                            langCode,
                            "event_edition",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição Curta</Label>
                    <Textarea
                      value={langData.short_description}
                      onChange={(e) =>
                        handleIntlChange(
                          langCode,
                          "short_description",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2">
                {editedEvent.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              {event.status === "approved" ? (
                <>
                  <Button
                    onClick={handleApprove}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    Salvar Alterações
                  </Button>
                  <Button variant="outline" onClick={onClose}>
                    Cancelar
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleApprove}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    Aprovar Evento
                  </Button>
                  <Button variant="destructive" onClick={handleDecline}>
                    Recusar Evento
                  </Button>
                  <Button variant="outline" onClick={onClose}>
                    Cancelar
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EventReviewModal;
